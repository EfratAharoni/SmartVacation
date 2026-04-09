import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DESTINATIONS = [
  "פריז, צרפת",
  "רומא, איטליה",
  "ברצלונה, ספרד",
  "אמסטרדם, הולנד",
  "לונדון, אנגליה",
  "דובאי, איחוד האמירויות",
  "באלי, אינדונזיה",
  "טוקיו, יפן",
  'ניו יורק, ארה"ב',
  'מיאמי, ארה"ב',
  "קנקון, מקסיקו",
  "סנטוריני, יוון",
  "פראג, צ'כיה",
  "בנגקוק, תאילנד",
  "מלדיביים",
  "איסטנבול, טורקיה",
  "ברלין, גרמניה",
  "ליסבון, פורטוגל",
];

export const parseSearchQuery = async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) {
    return res.status(400).json({ error: "query required" });
  }

  const currentYear = new Date().getFullYear();

  const prompt = `אתה עוזר חיפוש לאתר נסיעות ישראלי. המשתמש כתב בשפה חופשית: "${query}"

רשימת היעדים הזמינים: ${DESTINATIONS.join(", ")}

מתוך הבקשה, חלץ את המידע הבא:
1. destination - שם היעד המדויק מהרשימה לעיל (או null אם לא צוין או לא ברור).
   אם המשתמש כתב מדינה (יוון, תאילנד וכד'), בחר את היעד המתאים מהרשימה.
2. startDate - תאריך התחלה בפורמט YYYY-MM-DD (הנח שנה ${currentYear} אם לא צוין). null אם לא הוזכר.
3. endDate - תאריך סיום בפורמט YYYY-MM-DD. אם הוזכרה רק משך (שבוע = 7 ימים, 10 ימים וכד') חשב לפי startDate. null אם לא ניתן לקבוע.
4. budget - תקציב מקסימלי בשקלים כמספר שלם בלבד. null אם לא הוזכר.
5. guests - מספר נוסעים כמספר שלם (זוג = 2, משפחה עם 2 ילדים = 4). null אם לא הוזכר.

החזר JSON בלבד, ללא שום טקסט נוסף לפני או אחרי:
{"destination": ..., "startDate": ..., "endDate": ..., "budget": ..., "guests": ...}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("AI parse error:", err.message);
    res.status(500).json({ error: "AI parse failed" });
  }
};
