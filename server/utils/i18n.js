/**
 * Minimal server-side i18n for API messages.
 * The client sends `Accept-Language: he|en`; we answer in that language (default: Hebrew).
 */

const MESSAGES = {
  serverError:          { he: "שגיאת שרת פנימית", en: "Internal server error" },
  notFound:             { he: "הפריט לא נמצא", en: "Not found" },
  deleted:              { he: "נמחק בהצלחה", en: "Deleted successfully" },
  userNotFound:         { he: "משתמש לא נמצא", en: "User not found" },
  fullNameInvalid:      { he: "שם מלא חייב להכיל לפחות 2 תווים", en: "Full name must be at least 2 characters" },
  emailInvalid:         { he: "כתובת אימייל לא תקינה", en: "Invalid email address" },
  phoneInvalid:         { he: "מספר טלפון לא תקין", en: "Invalid phone number" },
  passwordTooShort:     { he: "סיסמה חייבת להכיל לפחות 6 תווים", en: "Password must be at least 6 characters" },
  emailTaken:           { he: "האימייל כבר רשום במערכת", en: "This email is already registered" },
  usersArrayRequired:   { he: "נדרש מערך משתמשים", en: "An array of users is required" },
  emailPasswordRequired:{ he: "נדרשים אימייל וסיסמה", en: "Email and password are required" },
  wrongCredentials:     { he: "אימייל או סיסמה שגויים", en: "Incorrect email or password" },
  passwordsRequired:    { he: "נדרשות סיסמה ישנה וחדשה", en: "Old and new passwords are required" },
  newPasswordTooShort:  { he: "הסיסמה החדשה חייבת להכיל לפחות 6 תווים", en: "The new password must be at least 6 characters" },
  oldPasswordWrong:     { he: "הסיסמה הישנה שגויה", en: "The old password is incorrect" },
  passwordChanged:      { he: "הסיסמה עודכנה בהצלחה", en: "Password updated successfully" },
  orderItemsRequired:   { he: "נדרש לפחות פריט אחד בהזמנה", en: "An order must contain at least one item" },
  orderCreated:         { he: "ההזמנה נוצרה בהצלחה", en: "Order created successfully" },
  orderNotFound:        { he: "ההזמנה לא נמצאה", en: "Order not found" },
  orderAlreadyCancelled:{ he: "ההזמנה כבר בוטלה", en: "This order has already been cancelled" },
  orderCancelled:       { he: "ההזמנה בוטלה", en: "The order was cancelled" },
  tooManyRequests:      { he: "יותר מדי בקשות, נסה שוב בעוד 15 דקות", en: "Too many requests, please try again in 15 minutes" },
  tooManyLogins:        { he: "יותר מדי ניסיונות התחברות, נסה שוב בעוד 15 דקות", en: "Too many login attempts, please try again in 15 minutes" },
  tooManyAi:            { he: "יותר מדי בקשות AI, נסה שוב בעוד דקה", en: "Too many AI requests, please try again in a minute" },
  tooManyPassword:      { he: "יותר מדי ניסיונות שינוי סיסמה, נסה שוב בעוד 15 דקות", en: "Too many password change attempts, please try again in 15 minutes" },
  tooManyContact:       { he: "יותר מדי הודעות, נסה שוב מאוחר יותר", en: "Too many messages, please try again later" },
  missingToken:         { he: "נדרשת התחברות", en: "Missing or invalid token" },
  invalidToken:         { he: "החיבור פג תוקף, יש להתחבר מחדש", en: "Invalid or expired token" },
  adminOnly:            { he: "הגישה למנהלים בלבד", en: "Access denied: admins only" },
  authCheckFailed:      { he: "בדיקת ההרשאה נכשלה", en: "Authorization check failed" },
  contactInvalid:       { he: "יש למלא שם, אימייל או טלפון תקינים והודעה", en: "Please provide a name, a valid email or phone, and a message" },
  contactReceived:      { he: "ההודעה התקבלה, נחזור אליך בהקדם", en: "Message received, we'll get back to you soon" },
  reviewInvalid:        { he: "יש לבחור דירוג בין 1 ל-5 ולכתוב ביקורת", en: "Please choose a rating from 1 to 5 and write a review" },
  reviewExists:         { he: "כבר כתבת ביקורת על הפריט הזה", en: "You have already reviewed this item" },
  resetSent:            { he: "אם האימייל רשום, נשלח אליו קישור לאיפוס סיסמה", en: "If this email is registered, a reset link has been sent to it" },
  resetInvalid:         { he: "הקישור לא תקין או שפג תוקפו", en: "The link is invalid or has expired" },
  invalidItem:          { he: "פריט לא תקין", en: "Invalid item" },
  uploadInvalid:        { he: "יש לבחור קובץ תמונה (JPG, PNG, WEBP, AVIF, GIF) עד 5MB", en: "Please choose an image file (JPG, PNG, WEBP, AVIF, GIF) up to 5MB" },
};

export const SUPPORTED_LANGS = ["he", "en"];

export const getLang = (req) => {
  const header = String(req?.headers?.["accept-language"] || "").toLowerCase();
  return header.startsWith("en") ? "en" : "he";
};

export const t = (req, key) => {
  const entry = MESSAGES[key];
  if (!entry) return key;
  return entry[getLang(req)] || entry.he;
};

/** Error carrying a message key, so services can stay language-agnostic. */
export class AppError extends Error {
  constructor(key, status = 400) {
    super(key);
    this.key = key;
    this.status = status;
  }
}

/** Express middleware: sets req.lang for convenience */
export const langMiddleware = (req, _res, next) => {
  req.lang = getLang(req);
  next();
};
