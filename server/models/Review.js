import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    itemType: { type: String, enum: ["deal", "attraction"], required: true },
    // Deals are reviewed per destination (all packages share reviews); attractions per id
    itemKey: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, maxLength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ itemType: 1, itemKey: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
