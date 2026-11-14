/**
 * Live exchange rates (ILS → USD / EUR) for displaying prices in other currencies.
 * Source: Frankfurter (European Central Bank reference rates, updated every business day),
 * with ExchangeRate-API as a fallback. Cached in memory for 6 hours.
 * If both sources fail, the last known rates are returned (or approximate defaults).
 */
const CACHE_MS = 6 * 60 * 60 * 1000;
const SYMBOLS = ["USD", "EUR"];
const DEFAULT_RATES = { USD: 0.31, EUR: 0.28 }; // used only if no source was ever reachable

let cache = null; // { rates, date, source, fetchedAt }

const fetchJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const pick = (rates) => {
  const out = {};
  for (const s of SYMBOLS) {
    const v = Number(rates?.[s]);
    if (!Number.isFinite(v) || v <= 0) throw new Error(`missing rate ${s}`);
    out[s] = v;
  }
  return out;
};

const sources = [
  async () => {
    const d = await fetchJson(`https://api.frankfurter.dev/v1/latest?base=ILS&symbols=${SYMBOLS.join(",")}`);
    return { rates: pick(d.rates), date: d.date, source: "Frankfurter (ECB)" };
  },
  async () => {
    const d = await fetchJson("https://open.er-api.com/v6/latest/ILS");
    if (d.result !== "success") throw new Error("bad response");
    return {
      rates: pick(d.rates),
      date: new Date(d.time_last_update_unix * 1000).toISOString().slice(0, 10),
      source: "ExchangeRate-API",
    };
  },
];

export const loadRates = async () => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache;
  for (const source of sources) {
    try {
      cache = { ...(await source()), fetchedAt: Date.now() };
      return cache;
    } catch (err) {
      console.warn("Exchange-rate source failed:", err.message);
    }
  }
  // all sources failed – keep serving the last good rates if we have them
  return cache || { rates: DEFAULT_RATES, date: null, source: "default", fetchedAt: 0 };
};

export const getRates = async (_req, res) => {
  const { rates, date, source } = await loadRates();
  res.set("Cache-Control", "public, max-age=3600");
  res.json({ base: "ILS", rates, date, source });
};
