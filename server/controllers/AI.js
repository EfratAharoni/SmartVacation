import Groq from "groq-sdk";
import Deal from "../models/Deal.js";

const MODEL = "llama-3.1-8b-instant";

const DESTINATIONS = [
  "פריז, צרפת", "רומא, איטליה", "ברצלונה, ספרד", "אמסטרדם, הולנד",
  "לונדון, אנגליה", "דובאי, איחוד האמירויות", "באלי, אינדונזיה",
  "טוקיו, יפן", 'ניו יורק, ארה"ב', 'מיאמי, ארה"ב', "קנקון, מקסיקו",
  "סנטוריני, יוון", "פראג, צ'כיה", "בנגקוק, תאילנד", "מלדיביים",
  "איסטנבול, טורקיה", "ברלין, גרמניה", "ליסבון, פורטוגל",
];

const VIBE_DESTINATIONS = {
  beach:     ["מלדיביים", "באלי", "מיאמי", "קנקון", "סנטוריני", "ברצלונה"],
  adventure: ["באלי", "בנגקוק", "דובאי", "איסטנבול", "טוקיו"],
  romantic:  ["פריז", "סנטוריני", "פראג", "ליסבון", "רומא"],
  city:      ["פריז", "לונדון", "ניו יורק", "ברלין", "אמסטרדם", "פראג", "רומא", "ברצלונה"],
};

// ── Groq client (lazy init) ──────────────────────────────────────────────────
let _groq = null;
function getGroq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

// ── Step 1: Parse free Hebrew text → structured filters ──────────────────────
async function parseWithGroq(query) {
  const currentYear = new Date().getFullYear();
  const prompt = `You are a travel search assistant for an Israeli travel site.
The user wrote in Hebrew: "${query}"

Available destinations: ${DESTINATIONS.join(", ")}

Extract and return ONLY a valid JSON object with these exact fields:
- destination: ONLY set this if the user mentioned a city or country. Map to an exact name from the list above.
  Country→city mapping: איטליה/Italy→"רומא, איטליה", ספרד/Spain→"ברצלונה, ספרד", יוון/Greece→"סנטוריני, יוון", תאילנד/Thailand→"בנגקוק, תאילנד", יפן/Japan→"טוקיו, יפן", אמריקה/USA→'ניו יורק, ארה"ב', צרפת/France→"פריז, צרפת", גרמניה/Germany→"ברלין, גרמניה", הולנד/Netherlands→"אמסטרדם, הולנד", פורטוגל/Portugal→"ליסבון, פורטוגל", טורקיה/Turkey→"איסטנבול, טורקיה", אינדונזיה/Indonesia→"באלי, אינדונזיה".
  If not mentioned at all, return null.
- startDate: YYYY-MM-DD or null. Use 1-indexed months: Jan=01,Feb=02,Mar=03,Apr=04,May=05,Jun=06,Jul=07,Aug=08,Sep=09,Oct=10,Nov=11,Dec=12. Assume year ${currentYear}.
- endDate: YYYY-MM-DD or null (calculate from startDate if duration given; 7 days after startDate if only month mentioned; null if no date at all).
- budget: max total budget in ILS as integer, or null
- guests: number of travelers as integer (זוג/couple=2, משפחה/family=4, לבד/solo=1), or null
- isKosher: true ONLY if the word כשר/כשרה/כשרות appears, false otherwise
- vibe: one of "beach","adventure","romantic","city","cheap" — only if clearly implied, otherwise null

IMPORTANT: Use JSON null (not the string "null") for missing values.
Return ONLY the JSON object, no explanation, no markdown.`;

  const resp = await getGroq().chat.completions.create({
    model: MODEL,
    max_tokens: 200,
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.choices[0].message.content.trim();
  // Strip possible markdown code fences
  const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(clean);

  // Groq sometimes returns the string "null" instead of JSON null — sanitize
  for (const key of Object.keys(parsed)) {
    if (parsed[key] === "null" || parsed[key] === "undefined") {
      parsed[key] = null;
    }
  }
  return parsed;
}

// ── Fallback: local rule-based parser (no API needed) ────────────────────────
function localParse(text) {
  const result = {
    destination: null, startDate: null, endDate: null,
    budget: null, guests: null, isKosher: false, vibe: null,
  };

  if (/כשר|כשרה|כשרות/.test(text)) { result.isKosher = true; result.vibe = "kosher"; }
  if (!result.vibe) {
    if (/בטן.{0,3}גב|חוף|ים|שמש|טרופי/.test(text)) result.vibe = "beach";
    else if (/אקסטרים|הרפתק|ספורט/.test(text))      result.vibe = "adventure";
    else if (/זול|זולה|תקציב|מוזל/.test(text))       result.vibe = "cheap";
    else if (/רומנטי|רומנטית|זוגי/.test(text))       result.vibe = "romantic";
    else if (/סיטי|עיר|תרבות/.test(text))            result.vibe = "city";
  }

  if (/זוג|שניים|שניינו/.test(text))   result.guests = 2;
  else if (/לבד|סולו|יחיד/.test(text)) result.guests = 1;
  else if (/משפחה/.test(text))         result.guests = 4;
  else { const m = text.match(/(\d+)\s*(נוסעים|אנשים)/); if (m) result.guests = parseInt(m[1], 10); }

  const bm = text.match(/(\d[\d,]+)\s*(₪|שקל|שקלים|ש"ח)/);
  if (bm) result.budget = parseInt(bm[1].replace(/,/g, ""), 10);

  const MONTHS = { ינואר:0, פברואר:1, מרץ:2, אפריל:3, מאי:4, יוני:5,
                   יולי:6, אוגוסט:7, ספטמבר:8, אוקטובר:9, נובמבר:10, דצמבר:11 };
  const year = new Date().getFullYear();
  for (const [name, idx] of Object.entries(MONTHS)) {
    if (text.includes(name)) {
      result.startDate = new Date(year, idx, 1).toISOString().slice(0, 10);
      result.endDate   = new Date(year, idx + 1, 0).toISOString().slice(0, 10);
      break;
    }
  }

  // Destination: check aliases
  const aliases = {
    "פריז, צרפת":           ["paris","france","פאריז","פריז","צרפת"],
    "רומא, איטליה":         ["rome","roma","italy","איטליה","רומא","רומה"],
    "ברצלונה, ספרד":        ["barcelona","spain","ספרד","ברצלונה"],
    "אמסטרדם, הולנד":       ["amsterdam","netherlands","הולנד","אמסטרדם"],
    "לונדון, אנגליה":        ["london","england","uk","אנגליה","לונדון"],
    "דובאי, איחוד האמירויות":["dubai","uae","דובאי","אמירויות"],
    "באלי, אינדונזיה":       ["bali","indonesia","אינדונזיה","באלי"],
    "טוקיו, יפן":            ["tokyo","japan","יפן","טוקיו"],
    'ניו יורק, ארה"ב':       ["new york","nyc","ניו יורק","ניויורק","אמריקה"],
    'מיאמי, ארה"ב':          ["miami","florida","פלורידה","מיאמי"],
    "קנקון, מקסיקו":         ["cancun","mexico","מקסיקו","קנקון"],
    "סנטוריני, יוון":        ["santorini","greece","יוון","סנטוריני"],
    "פראג, צ'כיה":           ["prague","czech","צ'כיה","פראג"],
    "בנגקוק, תאילנד":        ["bangkok","thailand","תאילנד","בנגקוק"],
    "מלדיביים":              ["maldives","מלדיב","מאלדיב"],
    "איסטנבול, טורקיה":      ["istanbul","turkey","טורקיה","איסטנבול"],
    "ברלין, גרמניה":         ["berlin","germany","גרמניה","ברלין"],
    "ליסבון, פורטוגל":       ["lisbon","portugal","פורטוגל","ליסבון"],
  };
  const q = text.toLowerCase();
  for (const [dest, tags] of Object.entries(aliases)) {
    if (tags.some(t => q.includes(t.toLowerCase()))) {
      result.destination = dest;
      break;
    }
  }

  return result;
}

// ── Step 2: Query MongoDB with parsed filters ────────────────────────────────
async function queryDeals(filters) {
  const query = {};

  if (filters.destination) {
    query.destination = { $regex: filters.destination.split(",")[0].trim(), $options: "i" };
  } else if (filters.vibe && VIBE_DESTINATIONS[filters.vibe]) {
    const keywords = VIBE_DESTINATIONS[filters.vibe];
    query.destination = { $in: keywords.map(k => new RegExp(k, "i")) };
  }

  if (filters.budget && filters.guests) {
    query.price = { $lte: Math.floor(filters.budget / filters.guests) };
  } else if (filters.budget) {
    query.price = { $lte: filters.budget };
  }

  if (filters.isKosher) {
    query.isKosherFriendly = true;
  }

  return Deal.find(query).limit(10).lean();
}

// ── Step 3: Rank deals with Groq + add Hebrew explanations ───────────────────
async function rankWithGroq(query, deals) {
  const slim = deals.map(d => ({
    id: d._id.toString(),
    destination: d.destination,
    price: d.price,
    rating: d.rating,
    discount: d.discount,
    hotel: d.hotel,
    included: d.included?.slice(0, 3),
    category: d.category,
    isKosher: d.isKosherFriendly,
  }));

  const prompt = `A user searched for a vacation with this request (in Hebrew): "${query}"

Here are ${slim.length} available deals. Rank them from most to least relevant based on the user's request.
For each deal, provide a short one-sentence explanation in Hebrew (max 15 words) explaining why it matches.

Deals:
${JSON.stringify(slim, null, 0)}

Return ONLY a valid JSON array, no markdown, no explanation:
[{"id":"...","score":9.5,"explanation":"..."}]`;

  const resp = await getGroq().chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.choices[0].message.content.trim();
  const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const ranked = JSON.parse(clean);

  // Merge explanations back into deals, preserve ranked order
  return ranked
    .map(r => {
      const deal = deals.find(d => d._id.toString() === r.id);
      if (!deal) return null;
      return { deal, score: r.score, explanation: r.explanation };
    })
    .filter(Boolean);
}

const MAX_QUERY_LENGTH = 300;
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s*prompt/i,
  /you\s+are\s+now/i,
  /forget\s+(everything|all)/i,
  /jailbreak/i,
];

function sanitizeQuery(raw) {
  const q = String(raw).trim().slice(0, MAX_QUERY_LENGTH);
  if (SUSPICIOUS_PATTERNS.some((p) => p.test(q))) return null;
  return q;
}

// ── Main endpoint ────────────────────────────────────────────────────────────
export const aiSearch = async (req, res) => {
  const raw = req.body?.query;
  if (!raw?.trim()) {
    return res.status(400).json({ error: "query required" });
  }

  const query = sanitizeQuery(raw);
  if (!query) {
    return res.status(400).json({ error: "Invalid query" });
  }

  // Step 1: Parse
  let filters;
  try {
    filters = await parseWithGroq(query);
  } catch (err) {
    console.warn("Groq parse failed, using local fallback:", err.message);
    filters = localParse(query);
  }

  // Step 2: Fetch matching deals
  let deals;
  try {
    deals = await queryDeals(filters);
  } catch (err) {
    console.error("MongoDB query failed:", err.message);
    return res.status(500).json({ error: "Database query failed" });
  }

  if (!deals.length) {
    return res.json({ filters, rankedDeals: [] });
  }

  // Step 3: Rank + explain
  let rankedDeals;
  try {
    rankedDeals = await rankWithGroq(query, deals);
  } catch (err) {
    console.warn("Groq ranking failed, returning unranked:", err.message);
    rankedDeals = deals.map(deal => ({ deal, score: null, explanation: null }));
  }

  res.json({ filters, rankedDeals });
};
