import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
    destination: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    dates: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    airline: { type: String, required: true },
    flightTime: { type: String },
    category: { type: String, required: true },
    hotel: { type: String, required: true },
    included: { type: [String], default: [] },
    reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

const Deal = mongoose.model("Deal", dealSchema);
export default Deal;