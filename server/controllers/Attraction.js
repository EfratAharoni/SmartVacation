import * as attractionService from "../services/Attraction.js";

// קבלת כל האטרקציות
export const getAttractions = async (req, res) => {
    try {
        const attractions = await attractionService.getAllAttractions();
        res.json(attractions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// קבלת אטרקציה בודדת לפי ID
export const getAttraction = async (req, res) => {
    try {
        const attraction = await attractionService.getAttractionById(req.params.id);
        if (!attraction) return res.status(404).json({ message: "Attraction not found" });
        res.json(attraction);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// יצירת אטרקציה בודדת
export const createAttraction = async (req, res) => {
    try {
        const newAttraction = await attractionService.createAttraction(req.body);
        res.status(201).json(newAttraction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// הוספת אטרקציות רבות (לשימוש עם ה-JSON הגדול שלך)
export const addManyAttractions = async (req, res) => {
    try {
        const attractions = await attractionService.createManyAttractions(req.body);
        res.status(201).json(attractions);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// מחיקת אטרקציה לפי ID
export const removeAttraction = async (req, res) => {
    try {
        const deleted = await attractionService.deleteAttractionById(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Attraction not found" });
        res.json({ message: "Attraction deleted", deleted });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// עדכון אטרקציה
export const updateAttraction = async (req, res) => {
    try {
        const updated = await attractionService.updateAttractionById(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Attraction not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};