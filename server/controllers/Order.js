import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { orderId, items, customerInfo, passengers, paymentMethod, totalAmount } = req.body;

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
    res.status(400).json({ message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
