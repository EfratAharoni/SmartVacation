import { randomUUID } from "crypto";
import Order from "../models/Order.js";
import Deal from "../models/Deal.js";
import Attraction from "../models/Attraction.js";
import { t, getLang } from "../utils/i18n.js";
import { sendOrderConfirmationEmail } from "../utils/mailer.js";

// Same pricing rules as the booking modal on the client (DealDetails / Cart)
const EXTRA_CANCELLABLE = 55;
const TROLLEY = 102;
const SUITCASE = 224;
const TRANSFER_PER_PERSON = 57;
const CHILD_RATE = 0.7;
const clampInt = (v, min, max, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

function calcDealTotal(price, opts) {
  if (!opts || typeof opts !== "object") return price; // legacy items without options
  const adults = clampInt(opts.adults, 1, 9, 1);
  const children = clampInt(opts.children, 0, 6, 0);
  const base = opts.cancellable ? price + EXTRA_CANCELLABLE : price;
  let total = base * adults + Math.round(base * CHILD_RATE) * children;
  if (opts.trolley) total += TROLLEY;
  if (opts.suitcase) total += SUITCASE;
  if (opts.transfer) total += TRANSFER_PER_PERSON * (adults + children);
  return total;
}

async function computeTotalAmount(items) {
  let total = 0;
  for (const item of items) {
    if (!item.itemId || !item.type) continue;

    if (item.type === "deal") {
      const deal = await Deal.findById(item.itemId).select("price").lean();
      if (deal) total += calcDealTotal(deal.price, item.bookingOptions);
    } else if (item.type === "attraction") {
      const attraction = await Attraction.findById(item.itemId).select("price childPrice").lean();
      if (attraction) {
        const qty = item.bookingQty || {};
        const adults = Number(qty.adults) || 0;
        const children = Number(qty.children) || 0;
        const childRate = attraction.childPrice ?? Math.round(attraction.price * 0.6); // matches client rounding
        total += adults * attraction.price + children * childRate;
      }
    }
  }
  return total;
}

export const createOrder = async (req, res) => {
  try {
    const { items, customerInfo, passengers, paymentMethod, wantsEmail } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: t(req, "orderItemsRequired") });
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

    if (wantsEmail !== false) sendOrderConfirmationEmail(order, getLang(req)); // fire-and-forget
    res.status(201).json({ message: t(req, "orderCreated"), order });
  } catch (err) {
    res.status(400).json({ message: t(req, "serverError") });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ message: t(req, "orderNotFound") });
    if (order.status === "cancelled")
      return res.status(400).json({ message: t(req, "orderAlreadyCancelled") });
    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();
    res.json({ message: t(req, "orderCancelled"), order });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};

// Admin: all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};
