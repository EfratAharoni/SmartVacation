import { randomUUID } from "crypto";
import Order from "../models/Order.js";
import Deal from "../models/Deal.js";
import Attraction from "../models/Attraction.js";

async function computeTotalAmount(items) {
  let total = 0;
  for (const item of items) {
    if (!item.itemId || !item.type) continue;

    if (item.type === "deal") {
      const deal = await Deal.findById(item.itemId).select("price").lean();
      if (deal) total += deal.price;
    } else if (item.type === "attraction") {
      const attraction = await Attraction.findById(item.itemId).select("price childPrice").lean();
      if (attraction) {
        const qty = item.bookingQty || {};
        const adults = Number(qty.adults) || 0;
        const children = Number(qty.children) || 0;
        const childRate = attraction.childPrice ?? attraction.price * 0.6;
        total += adults * attraction.price + children * childRate;
      }
    }
  }
  return total;
}

export const createOrder = async (req, res) => {
  try {
    const { items, customerInfo, passengers, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "נדרש לפחות פריט אחד בהזמנה" });
    }

    const totalAmount = await computeTotalAmount(items);
    const orderId = randomUUID();

    const order = await Order.create({
      userId: req.userId,
      orderId,
      items,
      customerInfo,
      passengers,
      paymentMethod,
      totalAmount,
      status: "completed",
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    res.status(400).json({ message: "שגיאת שרת פנימית" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};
