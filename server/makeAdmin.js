/**
 * Promote an existing user to admin.
 * Usage: node makeAdmin.js user@example.com
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "./DB/db.js";
import User from "./models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node makeAdmin.js <email>");
  process.exit(1);
}

await connectDB();
const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { returnDocument: "after" });
console.log(user ? `✅ ${user.email} is now an admin` : `❌ No user with email ${email}`);
await mongoose.disconnect();
