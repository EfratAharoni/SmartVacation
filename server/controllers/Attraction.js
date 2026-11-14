import * as attractionService from "../services/Attraction.js";
import { t } from "../utils/i18n.js";

// קבלת כל האטרקציות
export const getAttractions = async (req, res) => {
    try {
        const attractions = await attractionService.getAllAttractions();
        res.json(attractions);
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

// קבלת אטרקציה בודדת לפי ID
export const getAttraction = async (req, res) => {
    try {
        const attraction = await attractionService.getAttractionById(req.params.id);
        if (!attraction) return res.status(404).json({ message: t(req, "notFound") });
        res.json(attraction);
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

// יצירת אטרקציה בודדת
export const createAttraction = async (req, res) => {
    try {
        const newAttraction = await attractionService.createAttraction(req.body);
        res.status(201).json(newAttraction);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};

// הוספת אטרקציות רבות (לשימוש עם ה-JSON הגדול שלך)
export const addManyAttractions = async (req, res) => {
    try {
        const attractions = await attractionService.createManyAttractions(req.body);
        res.status(201).json(attractions);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};

// מחיקת אטרקציה לפי ID
export const removeAttraction = async (req, res) => {
    try {
        const deleted = await attractionService.deleteAttractionById(req.params.id);
        if (!deleted) return res.status(404).json({ message: t(req, "notFound") });
        res.json({ message: t(req, "deleted"), deleted });
    } catch (err) {
        res.status(500).json({ message: t(req, "serverError") });
    }
};

// עדכון אטרקציה
export const updateAttraction = async (req, res) => {
    try {
        const updated = await attractionService.updateAttractionById(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: t(req, "notFound") });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: t(req, "serverError") });
    }
};