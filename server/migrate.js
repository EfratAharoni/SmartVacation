/**
 * One-off, non-destructive data fixes for an existing database (keeps all _ids).
 * Usage: npm run migrate
 *  1. Deals: compute `departures` (real start/end dates) from the `dates` text
 *  2. Berlin destination info: replace the incorrect visa note
 * Safe to run more than once.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "./DB/db.js";
import Deal from "./models/Deal.js";
import DestinationInfo from "./models/DestinationInfo.js";
import { withDepartures } from "./utils/dates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const OLD_VISA = "🛂 נדרשת ויזת שנגן לאזרחי ישראל. יש לבקש לפחות 3 שבועות מראש";
const NEW_VISA = "🛂 אזרחי ישראל פטורים מויזה לשהייה של עד 90 יום. מומלץ לבדוק לפני הטיסה אם נדרש אישור ETIAS";
const OLD_VISA_EN = "🛂 A Schengen visa is required for Israeli citizens. Apply at least 3 weeks in advance";
const NEW_VISA_EN =
  "🛂 Israeli citizens don't need a visa for stays of up to 90 days. Check before you fly whether an ETIAS travel authorization is required";

await connectDB();

// 1. departures
const deals = await Deal.find().select("dates").lean();
const ops = deals.map((d) => ({
  updateOne: { filter: { _id: d._id }, update: { $set: { departures: withDepartures(d).departures } } },
}));
if (ops.length) await Deal.bulkWrite(ops);
console.log(`✅ departures set on ${ops.length} deals`);

// 2. Berlin visa note
const infos = await DestinationInfo.find({ $or: [{ info: OLD_VISA }, { "en.info": OLD_VISA_EN }] });
for (const doc of infos) {
  doc.info = doc.info.map((s) => (s === OLD_VISA ? NEW_VISA : s));
  if (doc.en?.info) {
    doc.en = { ...doc.en, info: doc.en.info.map((s) => (s === OLD_VISA_EN ? NEW_VISA_EN : s)) };
    doc.markModified("en");
  }
  await doc.save();
}
console.log(`✅ visa note fixed in ${infos.length} destination(s)`);

await mongoose.disconnect();
