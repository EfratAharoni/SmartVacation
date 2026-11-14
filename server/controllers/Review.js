import Review from "../models/Review.js";
import User from "../models/User.js";
import Attraction from "../models/Attraction.js";
import mongoose from "mongoose";
import { t } from "../utils/i18n.js";

const TYPES = ["deal", "attraction"];

export const getReviews = async (req, res) => {
  try {
    const { type, key } = req.params;
    if (!TYPES.includes(type)) return res.status(400).json({ message: t(req, "invalidItem") });
    const reviews = await Review.find({ itemType: type, itemKey: String(key) })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("-userId")
      .lean();
    const average = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;
    res.json({ reviews, average, count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};

export const createReview = async (req, res) => {
  try {
    const { type, key } = req.params;
    if (!TYPES.includes(type) || !key) return res.status(400).json({ message: t(req, "invalidItem") });

    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment ?? "").trim().slice(0, 1000);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 2)
      return res.status(400).json({ message: t(req, "reviewInvalid") });

    const user = await User.findById(req.userId).select("fullName");
    if (!user) return res.status(404).json({ message: t(req, "userNotFound") });

    const review = await Review.create({
      itemType: type,
      itemKey: String(key).slice(0, 200),
      userId: req.userId,
      userName: user.fullName,
      rating,
      comment,
    });
    const { userId: _omit, ...safe } = review.toObject();
    res.status(201).json({ review: safe });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: t(req, "reviewExists") });
    res.status(500).json({ message: t(req, "serverError") });
  }
};

// Admin moderation
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(500).select("-userId").lean();
    // attraction reviews are keyed by _id – attach the name for display
    const ids = reviews
      .filter((r) => r.itemType === "attraction" && mongoose.isValidObjectId(r.itemKey))
      .map((r) => r.itemKey);
    const attractions = await Attraction.find({ _id: { $in: ids } }).select("name en").lean();
    const byId = new Map(attractions.map((a) => [String(a._id), a]));
    res.json({
      reviews: reviews.map((r) => {
        const a = byId.get(r.itemKey);
        return a ? { ...r, itemName: a.name, itemNameEn: a.en?.name } : r;
      }),
    });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: t(req, "notFound") });
    res.json({ message: t(req, "deleted") });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};
