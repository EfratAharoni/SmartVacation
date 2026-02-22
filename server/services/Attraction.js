import Attraction from "../models/Attraction.js";

// קבלת כל האטרקציות
export const getAllAttractions = () => Attraction.find();

// קבלת אטרקציה בודדת
export const getAttractionById = (id) => Attraction.findById(id);

// יצירת אטרקציה בודדת (בלי הצפנה!)
export const createAttraction = (attractionData) => Attraction.create(attractionData);

// הוספת המערך הענק ששלחת קודם
export const createManyAttractions = (attractionsArray) => Attraction.insertMany(attractionsArray);

// מחיקת אטרקציה
export const deleteAttractionById = (id) => Attraction.findByIdAndDelete(id);

// עדכון פרטי אטרקציה
export const updateAttractionById = (id, updateData) => 
    Attraction.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });