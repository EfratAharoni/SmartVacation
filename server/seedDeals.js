import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import mongoose from "mongoose";
import connectDB from "./DB/db.js";
import Deal from "./models/Deal.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const seedDeals = async () => {
    await connectDB();

    const dealsData = JSON.parse(
        readFileSync(path.join(__dirname, "deals.json"), "utf-8")
    );

    // Remove the numeric "id" field before inserting (MongoDB uses _id)
    const dealsToInsert = dealsData.map(({ id, ...rest }) => rest);

    // Delete existing deals and re-seed fresh
    await Deal.deleteMany({});
    const inserted = await Deal.insertMany(dealsToInsert);
    console.log(`✅ Seeded ${inserted.length} deals successfully`);

    await mongoose.disconnect();
};

seedDeals().catch((err) => {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
});
