/**
 * API tests – run against an in-memory MongoDB (the real database is never touched).
 * Run: npm test
 */
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";

process.env.NODE_ENV = "test";

let app;
let mongod;
let Deal;
let Attraction;
let User;

const password = "secret123";
const registerUser = async (email, extra = {}) => {
  const res = await request(app)
    .post("/api/users/add")
    .send({ fullName: "Test User", email, phone: "050-1234567", password, ...extra });
  return res;
};
const login = async (email) => (await request(app).post("/api/users/login").send({ email, password })).body.token;

describe("Smart Vacation API", function () {
  this.timeout(120000); // first run downloads a MongoDB binary

  before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    ({ default: app } = await import("../main.js"));
    ({ default: Deal } = await import("../models/Deal.js"));
    ({ default: Attraction } = await import("../models/Attraction.js"));
    ({ default: User } = await import("../models/User.js"));
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  /* ───────────── Registration & login ───────────── */
  describe("Users", () => {
    it("registers a user and never returns the password", async () => {
      const res = await registerUser("a@test.com");
      expect(res.status).to.equal(201);
      expect(res.body.token).to.be.a("string");
      expect(res.body.user).to.include({ email: "a@test.com", role: "user" });
      expect(res.body.user).to.not.have.property("password");
    });

    it("ignores an attempt to register as admin", async () => {
      const res = await registerUser("sneaky@test.com", { role: "admin" });
      expect(res.status).to.equal(201);
      expect(res.body.user.role).to.equal("user");
    });

    it("rejects a duplicate email", async () => {
      const res = await registerUser("a@test.com");
      expect(res.status).to.equal(400);
    });

    it("validates input and answers in the requested language", async () => {
      const he = await request(app).post("/api/users/add").set("Accept-Language", "he").send({ email: "bad" });
      const en = await request(app).post("/api/users/add").set("Accept-Language", "en").send({ email: "bad" });
      expect(he.status).to.equal(400);
      expect(he.body.message).to.match(/[֐-׿]/);
      expect(en.body.message).to.equal("Full name must be at least 2 characters");
    });

    it("logs in with correct credentials and rejects wrong ones", async () => {
      const ok = await request(app).post("/api/users/login").send({ email: "a@test.com", password });
      expect(ok.status).to.equal(200);
      expect(ok.body.token).to.be.a("string");
      const bad = await request(app).post("/api/users/login").send({ email: "a@test.com", password: "wrong1" });
      expect(bad.status).to.equal(401);
    });

    it("saves and returns the cart & favorites", async () => {
      const token = await login("a@test.com");
      const cart = [{ _id: "x1", type: "deal", destination: "פריז, צרפת" }];
      const put = await request(app).put("/api/users/me/lists").set("Authorization", `Bearer ${token}`).send({ cart, favorites: [] });
      expect(put.status).to.equal(200);
      const get = await request(app).get("/api/users/me/lists").set("Authorization", `Bearer ${token}`);
      expect(get.body.cart).to.have.length(1);
    });

    it("does not reveal whether an email exists on forgot-password", async () => {
      const known = await request(app).post("/api/users/forgot-password").send({ email: "a@test.com" });
      const unknown = await request(app).post("/api/users/forgot-password").send({ email: "nobody@test.com" });
      expect(known.status).to.equal(200);
      expect(unknown.body.message).to.equal(known.body.message);
    });

    it("rejects an invalid reset token", async () => {
      const res = await request(app).post("/api/users/reset-password").send({ token: "nope", newPassword: "newpass1" });
      expect(res.status).to.equal(400);
    });
  });

  /* ───────────── Permissions ───────────── */
  describe("Permissions", () => {
    let userToken;
    let adminToken;

    before(async () => {
      await registerUser("user@test.com");
      await registerUser("admin@test.com");
      await User.updateOne({ email: "admin@test.com" }, { role: "admin" });
      userToken = await login("user@test.com");
      adminToken = await login("admin@test.com");
    });

    it("requires a token for protected routes", async () => {
      const res = await request(app).get("/api/orders/my");
      expect(res.status).to.equal(401);
    });

    it("blocks regular users from admin routes", async () => {
      for (const path of ["/api/users", "/api/orders", "/api/contact", "/api/reviews"]) {
        const res = await request(app).get(path).set("Authorization", `Bearer ${userToken}`);
        expect(res.status, path).to.equal(403);
      }
      const create = await request(app).post("/api/deals/add").set("Authorization", `Bearer ${userToken}`).send({});
      expect(create.status).to.equal(403);
    });

    it("lets admins use admin routes", async () => {
      const res = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body[0]).to.not.have.property("password");
    });

    it("lets only admins upload images, and serves the uploaded file", async () => {
      // 1×1 transparent PNG
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64"
      );
      const denied = await request(app)
        .post("/api/uploads")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("image", png, { filename: "a.png", contentType: "image/png" });
      expect(denied.status).to.equal(403);

      const notImage = await request(app)
        .post("/api/uploads")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", Buffer.from("hello"), { filename: "a.txt", contentType: "text/plain" });
      expect(notImage.status).to.equal(400);

      const ok = await request(app)
        .post("/api/uploads")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", png, { filename: "a.png", contentType: "image/png" });
      expect(ok.status).to.equal(201);
      expect(ok.body.url).to.match(/^\/api\/uploads\/.+\.png$/);
      const file = await request(app).get(ok.body.url);
      expect(file.status).to.equal(200);

      // clean up the test file
      const { unlink } = await import("fs/promises");
      const { UPLOAD_DIR } = await import("../controllers/Upload.js");
      await unlink(`${UPLOAD_DIR}/${ok.body.url.split("/").pop()}`);
    });

    it("lists all reviews for admins", async () => {
      const res = await request(app).get("/api/reviews").set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.reviews).to.be.an("array");
    });

    it("admin-created deals get real departure dates", async () => {
      const res = await request(app)
        .post("/api/deals/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          destination: "פריז, צרפת",
          image: "/images/paris.jpg",
          price: 1000,
          originalPrice: 1200,
          dates: ["15-22 מאי 2027", "1-8 מרץ 2027"],
          airline: "El Al",
          category: "europe",
          hotel: "מלון",
        });
      expect(res.status).to.equal(201);
      expect(res.body.departures).to.have.length(2);
      // sorted by start date
      expect(new Date(res.body.departures[0].start).toISOString().slice(0, 10)).to.equal("2027-03-01");
    });
  });

  /* ───────────── Orders ───────────── */
  describe("Orders", () => {
    let token;
    let otherToken;
    let deal;
    let attraction;
    let orderId;

    before(async () => {
      await registerUser("buyer@test.com");
      await registerUser("other@test.com");
      token = await login("buyer@test.com");
      otherToken = await login("other@test.com");
      deal = await Deal.create({
        destination: "רומא, איטליה", image: "/x.jpg", price: 1000, originalPrice: 1500,
        dates: ["3-10 יוני 2027"], airline: "Wizz", category: "europe", hotel: "מלון",
      });
      attraction = await Attraction.create({
        name: "קולוסיאום", location: "רומא, איטליה", category: "landmarks", price: 100,
      });
    });

    it("requires at least one item", async () => {
      const res = await request(app).post("/api/orders").set("Authorization", `Bearer ${token}`).send({ items: [] });
      expect(res.status).to.equal(400);
    });

    it("computes the total on the server and ignores a client-sent total", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          totalAmount: 1, // must be ignored
          wantsEmail: false,
          items: [
            // 2 adults + 1 child (70%), trolley 102, transfer 57×3, free cancellation +55/person-price
            {
              type: "deal",
              itemId: String(deal._id),
              bookingOptions: { adults: 2, children: 1, trolley: true, transfer: true, cancellable: true },
            },
            // 2 adults + 1 child (60% of 100 = 60)
            { type: "attraction", itemId: String(attraction._id), bookingQty: { adults: 2, children: 1 } },
          ],
        });
      expect(res.status).to.equal(201);
      const base = 1000 + 55;
      const dealTotal = base * 2 + Math.round(base * 0.7) + 102 + 57 * 3;
      const attractionTotal = 100 * 2 + 60;
      expect(res.body.order.totalAmount).to.equal(dealTotal + attractionTotal);
      orderId = res.body.order._id;
    });

    it("lists only the user's own orders", async () => {
      const mine = await request(app).get("/api/orders/my").set("Authorization", `Bearer ${token}`);
      const theirs = await request(app).get("/api/orders/my").set("Authorization", `Bearer ${otherToken}`);
      expect(mine.body.orders).to.have.length(1);
      expect(theirs.body.orders).to.have.length(0);
    });

    it("does not let another user cancel the order", async () => {
      const res = await request(app).put(`/api/orders/${orderId}/cancel`).set("Authorization", `Bearer ${otherToken}`);
      expect(res.status).to.equal(404);
    });

    it("cancels the order once", async () => {
      const first = await request(app).put(`/api/orders/${orderId}/cancel`).set("Authorization", `Bearer ${token}`);
      expect(first.status).to.equal(200);
      expect(first.body.order.status).to.equal("cancelled");
      const second = await request(app).put(`/api/orders/${orderId}/cancel`).set("Authorization", `Bearer ${token}`);
      expect(second.status).to.equal(400);
    });
  });

  /* ───────────── Reviews & contact ───────────── */
  describe("Reviews & contact", () => {
    let token;
    before(async () => {
      await registerUser("reviewer@test.com");
      token = await login("reviewer@test.com");
    });

    it("adds a review once per user and returns the average", async () => {
      const path = `/api/reviews/deal/${encodeURIComponent("פריז, צרפת")}`;
      const bad = await request(app).post(path).set("Authorization", `Bearer ${token}`).send({ rating: 9, comment: "x" });
      expect(bad.status).to.equal(400);
      const ok = await request(app).post(path).set("Authorization", `Bearer ${token}`).send({ rating: 4, comment: "Great trip" });
      expect(ok.status).to.equal(201);
      expect(ok.body.review).to.not.have.property("userId");
      const dup = await request(app).post(path).set("Authorization", `Bearer ${token}`).send({ rating: 5, comment: "Again" });
      expect(dup.status).to.equal(400);
      const list = await request(app).get(path);
      expect(list.body).to.include({ count: 1, average: 4 });
    });

    it("accepts a contact message with a phone or an email", async () => {
      const phoneOnly = await request(app).post("/api/contact").send({ name: "Dana", phone: "050-1234567", message: "Call me" });
      expect(phoneOnly.status).to.equal(201);
      const invalid = await request(app).post("/api/contact").send({ name: "Dana", message: "hi" });
      expect(invalid.status).to.equal(400);
    });
  });

  /* ───────────── Misc ───────────── */
  describe("Misc", () => {
    it("health check works", async () => {
      const res = await request(app).get("/health");
      expect(res.body).to.deep.equal({ status: "ok" });
    });

    it("moves past departures a year forward and keeps future ones", async () => {
      const { rollDealForward } = await import("../utils/dates.js");
      const deal = { dates: ["12-19 ינואר 2026", "5-12 נובמבר 2026", "12-19 ינואר 2027", "1-8 דצמבר 2026"], en: {} };
      const r = rollDealForward(deal, new Date("2026-11-15T10:00:00"));
      // Jan 2026 → Jan 2027 (merged with the existing one), Nov 5 2026 → Nov 2027, Dec 2026 stays
      expect(r.dates).to.deep.equal(["1-8 דצמבר 2026", "12-19 ינואר 2027", "5-12 נובמבר 2027"]);
      expect(r.en.dates).to.deep.equal(["December 1-8, 2026", "January 12-19, 2027", "November 5-12, 2027"]);
      // nothing to change → same object
      expect(rollDealForward({ dates: ["1-8 דצמבר 2030"] }, new Date("2026-11-15"))).to.deep.equal({ dates: ["1-8 דצמבר 2030"] });
    });

    it("never serves deals with past dates", async () => {
      await Deal.create({
        destination: "ברלין, גרמניה", image: "/x.jpg", price: 900, originalPrice: 900,
        dates: ["1-5 ינואר 2020"], airline: "X", category: "europe", hotel: "מלון",
      });
      const res = await request(app).get("/api/deals");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (const d of res.body) {
        for (const dep of d.departures) expect(new Date(dep.start).getTime()).to.be.at.least(today.getTime() - 86400000);
      }
      const berlin = res.body.find((d) => d.destination === "ברלין, גרמניה");
      expect(berlin.dates[0]).to.match(/^1-5 ינואר \d{4}$/);
      expect(Number(berlin.dates[0].slice(-4))).to.be.greaterThan(2025);
    });

    it("parses Hebrew deal dates into real dates", async () => {
      const { parseDealDateRange } = await import("../utils/dates.js");
      const r = parseDealDateRange("28-4 יולי 2026");
      expect(r.start.toISOString().slice(0, 10)).to.equal("2026-07-28");
      expect(r.end.toISOString().slice(0, 10)).to.equal("2026-08-04");
      expect(parseDealDateRange("not a date")).to.equal(null);
    });
  });
});
