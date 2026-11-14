/**
 * Deal dates are written for humans in Hebrew ("15-22 מאי 2026").
 * These helpers turn them into real Date ranges (stored as `departures`),
 * so sorting/filtering by date doesn't depend on parsing text.
 */
const HE_MONTHS = {
  ינואר: 0, פברואר: 1, מרץ: 2, אפריל: 3, מאי: 4, יוני: 5,
  יולי: 6, אוגוסט: 7, ספטמבר: 8, אוקטובר: 9, נובמבר: 10, דצמבר: 11,
};

/** "15-22 מאי 2026" → { label, start: Date(2026-05-15), end: Date(2026-05-22) } (UTC midnight) */
export const parseDealDateRange = (label) => {
  const m = String(label || "").trim().match(/^(\d{1,2})\s*-\s*(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!m) return null;
  const month = HE_MONTHS[m[3]];
  if (month === undefined) return null;
  const year = Number(m[4]);
  const startDay = Number(m[1]);
  const endDay = Number(m[2]);
  const start = new Date(Date.UTC(year, month, startDay));
  // "28-4 מאי" style ranges that cross into the next month
  const end = endDay >= startDay ? new Date(Date.UTC(year, month, endDay)) : new Date(Date.UTC(year, month + 1, endDay));
  return { label: m[0], start, end };
};

/** Adds `departures` (sorted by start) computed from `dates`, if dates are present */
export const withDepartures = (deal) => {
  if (!deal || !Array.isArray(deal.dates)) return deal;
  const departures = deal.dates
    .map(parseDealDateRange)
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);
  return { ...deal, departures };
};

/* ───────── Keeping deals in the future ───────── */
const HE_MONTH_NAMES = Object.keys(HE_MONTHS); // index = month number
const EN_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const addYears = (date, years) => {
  const d = new Date(date);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
};

/** "15-22 מאי 2026" style label for a departure */
export const heLabel = ({ start, end }) =>
  `${start.getUTCDate()}-${end.getUTCDate()} ${HE_MONTH_NAMES[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
/** "May 15-22, 2026" style label for a departure */
export const enLabel = ({ start, end }) =>
  `${EN_MONTH_NAMES[start.getUTCMonth()]} ${start.getUTCDate()}-${end.getUTCDate()}, ${start.getUTCFullYear()}`;

const todayUtc = (now = new Date()) => new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

/**
 * Departures whose start date has passed are moved forward by whole years until they are
 * in the future (same season next year). `dates` / `en.dates` labels are regenerated to match,
 * so the site never shows a package with a date that already passed.
 * Works on plain objects (use .lean() or toObject()).
 */
export const rollDealForward = (deal, now = new Date()) => {
  if (!deal) return deal;
  const departures = (deal.departures?.length ? deal.departures : withDepartures(deal).departures || [])
    .map((d) => ({ start: new Date(d.start), end: new Date(d.end) }))
    .filter((d) => !Number.isNaN(d.start.getTime()));
  if (!departures.length) return deal;

  const today = todayUtc(now);
  let changed = false;
  const rolled = departures.map((d) => {
    if (d.start >= today) return d;
    changed = true;
    let years = today.getUTCFullYear() - d.start.getUTCFullYear();
    if (years < 1) years = 1;
    let next = { start: addYears(d.start, years), end: addYears(d.end, years) };
    if (next.start < today) next = { start: addYears(d.start, years + 1), end: addYears(d.end, years + 1) };
    return next;
  });
  if (!changed) return deal;

  // sort and drop duplicates (a rolled date can land on one that already exists)
  const seen = new Set();
  const unique = rolled
    .sort((a, b) => a.start - b.start)
    .filter((d) => {
      const key = d.start.toISOString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return {
    ...deal,
    dates: unique.map(heLabel),
    departures: unique.map((d) => ({ label: heLabel(d), start: d.start, end: d.end })),
    en: deal.en ? { ...deal.en, dates: unique.map(enLabel) } : deal.en,
  };
};
