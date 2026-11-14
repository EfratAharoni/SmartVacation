/**
 * Adds an `en` object to every item in data/*.json, using data/translations.en.json.
 * Hebrew stays the canonical value (used for filtering/search); `en` holds display text.
 *
 * Usage:
 *   node addTranslations.js        → updates the JSON seed files in place
 *   node addTranslations.js --db   → also adds `en` to the documents already in MongoDB
 *                                    (non-destructive: only sets the `en` field, keeps _ids)
 * After adding new Hebrew content, add its translation to translations.en.json and rerun.
 */
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = (f) => path.join(__dirname, "data", f);
const dict = JSON.parse(readFileSync(dataPath("translations.en.json"), "utf-8"));

const MONTHS = {
  ינואר: "January", פברואר: "February", מרץ: "March", אפריל: "April", מאי: "May", יוני: "June",
  יולי: "July", אוגוסט: "August", ספטמבר: "September", אוקטובר: "October", נובמבר: "November", דצמבר: "December",
};

const missing = new Set();

const tr = (value) => {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(tr);
  if (typeof value !== "string" || !/[֐-׿]/.test(value)) return value;
  if (dict[value]) return dict[value];
  // "15-22 מאי 2026" → "May 15-22, 2026"
  const m = value.match(/^(\d{1,2}-\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (m && MONTHS[m[2]]) return `${MONTHS[m[2]]} ${m[1]}, ${m[3]}`;
  missing.add(value);
  return value;
};

const pick = (item, fields) => {
  const en = {};
  for (const f of fields) if (item[f] !== undefined) en[f] = tr(item[f]);
  return en;
};

const builders = {
  "deals.json": (d) => ({
    ...pick(d, ["destination", "dates", "airline", "flightTime", "hotel", "hotelName", "included", "attractions"]),
    ...(d.flightDetails?.class ? { flightClass: tr(d.flightDetails.class) } : {}),
  }),
  "attractions.json": (a) => pick(a, ["name", "location", "duration", "description", "highlights"]),
  "DestinationInfo.json": (i) => pick(i, ["destination", "country", "info"]),
};

for (const [file, build] of Object.entries(builders)) {
  const items = JSON.parse(readFileSync(dataPath(file), "utf-8"));
  const updated = items.map((item) => {
    const { en: _old, ...rest } = item;
    return { ...rest, en: build(rest) };
  });
  writeFileSync(dataPath(file), JSON.stringify(updated, null, 2) + "\n", "utf-8");
  console.log(`✅ ${file}: ${updated.length} items`);
}

if (process.argv.includes("--db")) {
  const { default: dotenv } = await import("dotenv");
  dotenv.config({ path: path.join(__dirname, ".env") });
  const { default: mongoose } = await import("mongoose");
  const { default: connectDB } = await import("./DB/db.js");
  const models = {
    "deals.json": (await import("./models/Deal.js")).default,
    "attractions.json": (await import("./models/Attraction.js")).default,
    "DestinationInfo.json": (await import("./models/DestinationInfo.js")).default,
  };
  await connectDB();
  for (const [file, Model] of Object.entries(models)) {
    const docs = await Model.find().lean();
    const ops = docs.map((doc) => ({
      updateOne: { filter: { _id: doc._id }, update: { $set: { en: builders[file](doc) } } },
    }));
    if (ops.length) await Model.bulkWrite(ops);
    console.log(`✅ DB ${Model.modelName}: added en to ${ops.length} documents`);
  }
  await mongoose.disconnect();
}

if (missing.size) {
  console.warn(`⚠️ ${missing.size} strings without translation:`);
  for (const s of missing) console.warn("  -", s);
}
