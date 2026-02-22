import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, minLength: 5 },
    email: { type: String, required: true, unique: true }, 
    phone: { type: String, required: true },
    password: { type: String, required: true, minLength: 6 },
});

const User = mongoose.model("User", userSchema);
export default User;