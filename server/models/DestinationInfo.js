import mongoose from "mongoose";

const destinationInfoSchema = new mongoose.Schema({
    destination: { type: String, required: true },
    country: { type: String, required: true },
    info: { type: [String], default: [] }
}, { timestamps: true });

const DestinationInfo = mongoose.model("DestinationInfo", destinationInfoSchema);
export default DestinationInfo;
