import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxLength: 100 },
    email: { type: String, maxLength: 200 },
    phone: { type: String, maxLength: 30 },
    subject: { type: String, maxLength: 200 },
    message: { type: String, required: true, maxLength: 3000 },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
