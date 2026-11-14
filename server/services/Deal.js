import Deal from "../models/Deal.js";
import { withDepartures, rollDealForward } from "../utils/dates.js";

// Deals are always served with future dates only (past departures roll forward a year)
const fresh = (docs) => (Array.isArray(docs) ? docs.map((d) => rollDealForward(d)) : rollDealForward(docs));

// קבלת כל הדילים
export const getAllDeals = async () => fresh(await Deal.find().lean());

// קבלת דילים לפי קטגוריה (אירופה, אסיה וכו')
export const getDealsByCategory = async (category) => fresh(await Deal.find({ category }).lean());

// קבלת דיל בודד לפי ID
export const getDealById = async (id) => fresh(await Deal.findById(id).lean());

// יצירת דיל חדש
export const createDeal = (dealData) => Deal.create(withDepartures(dealData));

// הוספת מערך הדילים הגדול (ה-JSON)
export const createManyDeals = (dealsArray) => Deal.insertMany(dealsArray.map(withDepartures));

// מחיקת דיל
export const deleteDealById = (id) => Deal.findByIdAndDelete(id);

// עדכון דיל קיים
export const updateDealById = (id, updateData) => 
    Deal.findByIdAndUpdate(id, withDepartures(updateData), { returnDocument: "after", runValidators: true });