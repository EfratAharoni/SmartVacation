import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
    destination: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    dates: { type: [String], required: true },
    // real date ranges derived from `dates` (see utils/dates.js) – used for sorting/filtering
    departures: {
        type: [{ _id: false, label: String, start: Date, end: Date }],
        default: [],
    },
    rating: { type: Number, min: 1, max: 5 },
    airline: { type: String, required: true },
    flightTime: { type: String },
    category: { type: String, required: true },
    hotel: { type: String, required: true },
    hotelName: { type: String },
    included: { type: [String], default: [] },
    reviewsCount: { type: Number, default: 0 },
    flightDetails: {
        departure: { type: String },
        arrival: { type: String },
        class: { type: String }
    },
    attractions: { type: [String], default: [] },
    isKosherFriendly: { type: Boolean, default: false },
    currency: { type: String },
    visaInfo: { type: String },
    weather: { type: String },
    electricityInfo: { type: String },
    travelTips: { type: [String], default: [] },
    // English display text (Hebrew fields stay canonical for search/filtering)
    en: { type: mongoose.Schema.Types.Mixed, default: {} },
    emergencyContacts: {
        police: { type: String },
        ambulance: { type: String },
        israeliEmbassy: { type: String }
    }
}, { timestamps: true });

const Deal = mongoose.model("Deal", dealSchema);
export default Deal;