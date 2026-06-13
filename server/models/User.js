import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, minLength: 2 },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
});

const User = mongoose.model("User", userSchema);
export default User;