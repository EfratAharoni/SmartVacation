import nodemailer from "nodemailer";

/**
 * Sends email via SMTP when SMTP_HOST is configured.
 * Without SMTP config (local dev) the email is printed to the console instead,
 * so flows like password reset can still be tested.
 */
let transporter = null;
const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
};

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (process.env.NODE_ENV === "test") return;
  if (!t) {
    console.log(`📧 [mail not configured] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ")}\n`);
    return;
  }
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html });
  } catch (err) {
    // Email failures must never break the main request
    console.error("Mail send failed:", err.message);
  }
};

const wrap = (lang, body) =>
  `<div dir="${lang === "en" ? "ltr" : "rtl"}" style="font-family:Arial,sans-serif;max-width:560px;margin:auto">${body}<p style="color:#888;font-size:12px">Smart Vacation</p></div>`;

export const sendPasswordResetEmail = (user, link, lang) =>
  sendMail({
    to: user.email,
    subject: lang === "en" ? "Reset your Smart Vacation password" : "איפוס סיסמה - Smart Vacation",
    html: wrap(
      lang,
      lang === "en"
        ? `<h2>Hi ${escapeHtml(user.fullName)},</h2><p>Click the link below to choose a new password (valid for one hour):</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`
        : `<h2>שלום ${escapeHtml(user.fullName)},</h2><p>לחצו על הקישור כדי לבחור סיסמה חדשה (בתוקף לשעה):</p><p><a href="${link}">${link}</a></p><p>אם לא ביקשתם איפוס, אפשר להתעלם מהמייל.</p>`
    ),
  });

export const sendOrderConfirmationEmail = (order, lang) => {
  const to = order.customerInfo?.email;
  if (!to) return Promise.resolve();
  const items = (order.items || [])
    .map((i) => `<li>${escapeHtml(i.name || i.destination)}${i.dates ? ` · ${escapeHtml(i.dates)}` : ""}</li>`)
    .join("");
  const total = `₪${Number(order.totalAmount || 0).toLocaleString()}`;
  return sendMail({
    to,
    subject: lang === "en" ? `Order confirmation #${order.orderId.slice(0, 8)}` : `אישור הזמנה #${order.orderId.slice(0, 8)}`,
    html: wrap(
      lang,
      lang === "en"
        ? `<h2>Thank you for your order!</h2><p>Order number: <b>${order.orderId.slice(0, 8)}</b></p><ul>${items}</ul><p>Total: <b>${total}</b></p>`
        : `<h2>תודה על ההזמנה!</h2><p>מספר הזמנה: <b>${order.orderId.slice(0, 8)}</b></p><ul>${items}</ul><p>סה"כ: <b>${total}</b></p>`
    ),
  });
};
