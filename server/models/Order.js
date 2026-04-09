import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ["deal", "attraction"] },
  itemId: String,
  name: String,
  image: String,
  price: Number,
  totalPrice: Number,
  dates: String,
  destination: String,
  location: String,
  bookingOptions: mongoose.Schema.Types.Mixed,
  bookingQty: mongoose.Schema.Types.Mixed,
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: String, unique: true, required: true },
    items: [itemSchema],
    customerInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      country: String,
    },
    passengers: [{ firstName: String, lastName: String }],
    paymentMethod: String,
    totalAmount: Number,
    status: { type: String, default: "completed" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
