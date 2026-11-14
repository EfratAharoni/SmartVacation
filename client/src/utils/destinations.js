/**
 * English names for destination strings used in the UI.
 * Hebrew stays the canonical key (deals are filtered/grouped by the Hebrew name);
 * this map is only used for display when the language is English.
 */
export const DESTINATION_EN = {
  "פריז, צרפת": "Paris, France",
  "רומא, איטליה": "Rome, Italy",
  "ברצלונה, ספרד": "Barcelona, Spain",
  "אמסטרדם, הולנד": "Amsterdam, Netherlands",
  "לונדון, אנגליה": "London, England",
  "דובאי, איחוד האמירויות": "Dubai, UAE",
  "באלי, אינדונזיה": "Bali, Indonesia",
  "טוקיו, יפן": "Tokyo, Japan",
  'ניו יורק, ארה"ב': "New York, USA",
  'מיאמי, ארה"ב': "Miami, USA",
  "קנקון, מקסיקו": "Cancún, Mexico",
  "סנטוריני, יוון": "Santorini, Greece",
  "פראג, צ'כיה": "Prague, Czechia",
  "בנגקוק, תאילנד": "Bangkok, Thailand",
  "מלדיביים": "Maldives",
  "איסטנבול, טורקיה": "Istanbul, Turkey",
  "ברלין, גרמניה": "Berlin, Germany",
  "ליסבון, פורטוגל": "Lisbon, Portugal",
  "פורטוגל, ליסבון": "Lisbon, Portugal",
  "פורטוגל - ליסבון": "Lisbon, Portugal",
};

const MONTHS_EN = {
  ינואר: "January", פברואר: "February", מרץ: "March", אפריל: "April", מאי: "May", יוני: "June",
  יולי: "July", אוגוסט: "August", ספטמבר: "September", אוקטובר: "October", נובמבר: "November", דצמבר: "December",
};

/** "15-22 מאי 2026" → "May 15-22, 2026" */
export const translateDealDate = (text) => {
  if (typeof text !== "string") return text;
  const m = text.match(/^(\d{1,2}-\d{1,2})\s+(\S+)\s+(\d{4})$/);
  return m && MONTHS_EN[m[2]] ? `${MONTHS_EN[m[2]]} ${m[1]}, ${m[3]}` : text;
};
