import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import mongoose from "mongoose";
import connectDB from "./DB/db.js";
import Attraction from "./models/Attraction.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const seedAttractions = async () => {
    await connectDB();

    const attractionsData = JSON.parse(
        readFileSync(path.join(__dirname, "data/attractions.json"), "utf-8")
    );

    await Attraction.deleteMany({});
    const inserted = await Attraction.insertMany(attractionsData);
    console.log(`✅ Seeded ${inserted.length} attractions successfully`);

    await mongoose.disconnect();
};

seedAttractions().catch((err) => {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
});
