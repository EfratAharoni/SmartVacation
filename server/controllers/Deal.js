import * as dealService from "../services/Deal.js";
import { t } from "../utils/i18n.js";

// קבלת כל הדילים (כולל אפשרות לסינון לפי קטגוריה אם תרצי בהמשך)
export const getDeals = async (req, res) => {
    try {
        const { category } = req.query;
        const deals = category ? await dealService.getDealsByCategory(category) : await dealService.getAllDeals();
        res.json(deals);
    } catch (err) { res.status(500).json({ message: t(req, "serverError") }); }
};

// קבלת דיל בודד לפי ID
export const getDeal = async (req, res) => {
    try {
        const deal = await dealService.getDealById(req.params.id);
        if (!deal) return res.status(404).json({ message: t(req, "notFound") });
        res.json(deal);
    } catch (err) { res.status(500).json({ message: t(req, "serverError") }); }
};

// יצירת דיל חדש
export const createDeal = async (req, res) => {
    try {
        const newDeal = await dealService.createDeal(req.body);
        res.status(201).json(newDeal);
    } catch (err) { res.status(400).json({ message: t(req, "serverError") }); }
};

// הוספת כמות גדולה של דילים (מושלם להרצה ראשונית של ה-JSON שנתת לי)
export const addManyDeals = async (req, res) => {
    try {
        const deals = await dealService.createManyDeals(req.body);
        res.status(201).json(deals);
    } catch (err) { res.status(400).json({ message: t(req, "serverError") }); }
};

// עדכון דיל קיים
export const updateDeal = async (req, res) => {
    try {
        const updated = await dealService.updateDealById(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: t(req, "notFound") });
        res.json(updated);
    } catch (err) { res.status(400).json({ message: t(req, "serverError") }); }
};

// מחיקת דיל
export const removeDeal = async (req, res) => {
    try {
        const deleted = await dealService.deleteDealById(req.params.id);
        if (!deleted) return res.status(404).json({ message: t(req, "notFound") });
        res.json({ message: t(req, "deleted") });
    } catch (err) { res.status(500).json({ message: t(req, "serverError") }); }
};