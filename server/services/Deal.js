import Deal from "../models/Deal.js";

// קבלת כל הדילים
export const getAllDeals = () => Deal.find();

// קבלת דילים לפי קטגוריה (אירופה, אסיה וכו')
export const getDealsByCategory = (category) => Deal.find({ category });

// קבלת דיל בודד לפי ID
export const getDealById = (id) => Deal.findById(id);

// יצירת דיל חדש
export const createDeal = (dealData) => Deal.create(dealData);

// הוספת מערך הדילים הגדול (ה-JSON)
export const createManyDeals = (dealsArray) => Deal.insertMany(dealsArray);

// מחיקת דיל
export const deleteDealById = (id) => Deal.findByIdAndDelete(id);

// עדכון דיל קיים
export const updateDealById = (id, updateData) => 
    Deal.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });