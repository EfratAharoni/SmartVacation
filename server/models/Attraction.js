import mongoose from "mongoose";

const attractionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String },
    rating: { type: Number, default: 0 },
    image: { type: String },
    description: { type: String },
    highlights: [{ type: String }] 
}, { timestamps: true });

const Attraction = mongoose.model("Attraction", attractionSchema);
export default Attraction;