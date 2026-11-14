import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, minLength: 2 },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Synced from the client so the cart/favorites follow the user across devices
    cart: { type: [mongoose.Schema.Types.Mixed], default: [] },
    favorites: { type: [mongoose.Schema.Types.Mixed], default: [] },
    preferredLanguage: { type: String, enum: ["he", "en"], default: "he" },
    // Password reset (token is stored hashed)
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
});

const User = mongoose.model("User", userSchema);
export default User;
