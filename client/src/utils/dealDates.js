/**
 * Real dates for deals. The server stores `departures: [{ label, start, end }]`
 * (computed from the human-readable `dates` text). Older items that don't have it
 * yet fall back to parsing the Hebrew text.
 */
const HE_MONTHS = {
  ינואר: 0, פברואר: 1, מרץ: 2, אפריל: 3, מאי: 4, יוני: 5,
  יולי: 6, אוגוסט: 7, ספטמבר: 8, אוקטובר: 9, נובמבר: 10, דצמבר: 11,
};

export const parseDealDateRange = (label) => {
  const m = String(label || "").trim().match(/^(\d{1,2})\s*-\s*(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!m || HE_MONTHS[m[3]] === undefined) return null;
  const [year, month, d1, d2] = [Number(m[4]), HE_MONTHS[m[3]], Number(m[1]), Number(m[2])];
  const start = new Date(Date.UTC(year, month, d1));
  const end = d2 >= d1 ? new Date(Date.UTC(year, month, d2)) : new Date(Date.UTC(year, month + 1, d2));
  return { label: m[0], start, end };
};

/** All departures of a deal as { label, start: Date, end: Date }, sorted by start */
export const getDepartures = (deal) => {
  if (Array.isArray(deal?.departures) && deal.departures.length) {
    return deal.departures
      .map((d) => ({ label: d.label, start: new Date(d.start), end: new Date(d.end) }))
      .sort((a, b) => a.start - b.start);
  }
  const dates = Array.isArray(deal?.dates) ? deal.dates : deal?.dates ? [deal.dates] : [];
  return dates.map(parseDealDateRange).filter(Boolean).sort((a, b) => a.start - b.start);
};

/** Earliest departure start (ms), or Infinity when unknown – handy for sorting */
export const firstDepartureTime = (deal) => {
  const [first] = getDepartures(deal);
  return first ? first.start.getTime() : Infinity;
};

/** true when at least one departure starts inside [from, to] (inclusive, by calendar day) */
export const departsBetween = (deal, from, to) => {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  return getDepartures(deal).some((d) => {
    // compare by calendar day (departures are stored at UTC midnight)
    const day = new Date(d.start.getUTCFullYear(), d.start.getUTCMonth(), d.start.getUTCDate());
    return day >= start && day <= end;
  });
};

/* ───────── Keeping saved items (cart / favorites) in the future ─────────
   Same rule as the server (server/utils/dates.js → rollDealForward):
   a departure whose start date has passed moves forward by whole years. */
const HE_MONTH_NAMES = Object.keys(HE_MONTHS);

const rollLabel = (label, today) => {
  const r = parseDealDateRange(label);
  if (!r) return label;
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (r.start.getTime() >= todayUtc) return label;
  let years = Math.max(1, today.getFullYear() - r.start.getUTCFullYear());
  const shift = (d, y) => new Date(Date.UTC(d.getUTCFullYear() + y, d.getUTCMonth(), d.getUTCDate()));
  if (shift(r.start, years).getTime() < todayUtc) years += 1;
  const start = shift(r.start, years);
  const end = shift(r.end, years);
  return `${start.getUTCDate()}-${end.getUTCDate()} ${HE_MONTH_NAMES[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
};

/** Returns the item with past dates moved to the future (or the same object if nothing changed) */
export const rollSavedDealForward = (item, today = new Date()) => {
  if (!item || item.type !== "deal" || !item.dates) return item;
  if (Array.isArray(item.dates)) {
    const rolled = [...new Set(item.dates.map((d) => rollLabel(d, today)))];
    if (rolled.every((d, i) => d === item.dates[i]) && rolled.length === item.dates.length) return item;
    rolled.sort((a, b) => (parseDealDateRange(a)?.start ?? 0) - (parseDealDateRange(b)?.start ?? 0));
    // drop stale derived fields – English labels are re-derived from the Hebrew text
    const { departures: _d, ...rest } = item;
    return { ...rest, dates: rolled, en: item.en ? { ...item.en, dates: undefined } : item.en };
  }
  const rolled = rollLabel(item.dates, today);
  return rolled === item.dates ? item : { ...item, dates: rolled };
};
