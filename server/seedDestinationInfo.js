import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import mongoose from "mongoose";
import connectDB from "./DB/db.js";
import DestinationInfo from "./models/DestinationInfo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const seedDestinationInfo = async () => {
    await connectDB();

    const data = JSON.parse(
        readFileSync(path.join(__dirname, "data/DestinationInfo.json"), "utf-8")
    );

    await DestinationInfo.deleteMany({});
    const inserted = await DestinationInfo.insertMany(data);
    console.log(`✅ Seeded ${inserted.length} destination infos successfully`);

    await mongoose.disconnect();
};

seedDestinationInfo().catch((err) => {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
});
