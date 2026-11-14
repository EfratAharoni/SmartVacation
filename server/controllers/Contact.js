import ContactMessage from "../models/ContactMessage.js";
import { t } from "../utils/i18n.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v, max) => String(v ?? "").trim().slice(0, max);

export const createContactMessage = async (req, res) => {
  try {
    const name = str(req.body?.name, 100);
    const email = str(req.body?.email, 200);
    const message = str(req.body?.message, 3000);
    const phone = str(req.body?.phone, 30);
    const hasEmail = EMAIL_RE.test(email);
    const hasPhone = /^[\d\s\-+()]{7,20}$/.test(phone);
    // email or phone is enough (the home-page "call me back" form only has a phone)
    if (name.length < 2 || (!hasEmail && !hasPhone) || message.length < 2 || (email && !hasEmail))
      return res.status(400).json({ message: t(req, "contactInvalid") });

    await ContactMessage.create({
      name,
      email,
      message,
      phone,
      subject: str(req.body?.subject, 200),
    });
    res.status(201).json({ message: t(req, "contactReceived") });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};

// Admin
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};

export const toggleHandled = async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: t(req, "notFound") });
    msg.handled = !msg.handled;
    await msg.save();
    res.json({ message: msg });
  } catch (err) {
    res.status(500).json({ message: t(req, "serverError") });
  }
};
