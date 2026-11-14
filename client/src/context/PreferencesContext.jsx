import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../utils/api";

/**
 * Display preferences: currency and theme (light / dark).
 * Prices are stored and charged in ILS – other currencies are display-only conversions,
 * using live exchange rates from the server (/api/rates), cached locally for 6 hours.
 */
const PreferencesContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const CURRENCIES = {
  ILS: { symbol: "₪" },
  USD: { symbol: "$" },
  EUR: { symbol: "€" },
};
// used only until the first successful fetch
const FALLBACK_RATES = { ILS: 1, USD: 0.31, EUR: 0.28 };
const RATES_KEY = "fxRates";
const RATES_MAX_AGE = 6 * 60 * 60 * 1000;

const readCachedRates = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(RATES_KEY) || "null");
    return cached?.rates ? cached : null;
  } catch {
    return null;
  }
};

const read = (key, fallback, allowed) => {
  try {
    const v = localStorage.getItem(key);
    return allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable – ignore */
  }
};

export const PreferencesProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currency, setCurrencyState] = useState(() => read("currency", "ILS", Object.keys(CURRENCIES)));
  const [theme, setThemeState] = useState(() => read("theme", "light", ["light", "dark"]));
  const [fx, setFx] = useState(() => readCachedRates() || { rates: FALLBACK_RATES, date: null, fetchedAt: 0 });

  // refresh exchange rates when the cached ones are older than 6 hours
  useEffect(() => {
    if (Date.now() - (fx.fetchedAt || 0) < RATES_MAX_AGE) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/rates`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled || !data?.rates) return;
        const next = { rates: { ILS: 1, ...data.rates }, date: data.date, source: data.source, fetchedAt: Date.now() };
        setFx(next);
        write(RATES_KEY, JSON.stringify(next));
      })
      .catch(() => {
        /* keep the last known rates */
      });
    return () => {
      cancelled = true;
    };
  }, [fx.fetchedAt]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setCurrency = useCallback((c) => {
    setCurrencyState(c);
    write("currency", c);
  }, []);
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      write("theme", next);
      return next;
    });
  }, []);

  const locale = i18n.language === "en" ? "en-US" : "he-IL";

  /** Format an ILS amount in the selected currency, e.g. ₪1,999 / $540 / €500 */
  const price = useCallback(
    (amountIls) => {
      const { symbol } = CURRENCIES[currency];
      const rate = fx.rates[currency] ?? FALLBACK_RATES[currency];
      const value = Math.round((Number(amountIls) || 0) * rate);
      return `${symbol}${value.toLocaleString(locale)}`;
    },
    [currency, locale, fx.rates]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      price,
      theme,
      toggleTheme,
      isConverted: currency !== "ILS",
      rates: fx.rates,
      ratesDate: fx.date,
    }),
    [currency, setCurrency, price, theme, toggleTheme, fx.rates, fx.date]
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
};
