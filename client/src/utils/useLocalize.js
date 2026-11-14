import { useCallback, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { DESTINATION_EN, translateDealDate } from "./destinations";
import { getCatalogItem, getCatalogVersion, subscribeCatalog } from "./catalog";

/**
 * Helpers for showing DB content in the current language.
 * Items from the server carry Hebrew fields + an `en` object with English display text.
 * Older copies (saved in cart/favorites/orders before translations existed) are
 * resolved through the live catalog by _id.
 */
export default function useLocalize() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "he";
  const isEn = lang === "en";
  const locale = isEn ? "en-US" : "he-IL";

  // re-render once the catalog (used for old items) has loaded – only matters in English
  const catalogVersion = useSyncExternalStore(
    (cb) => (isEn ? subscribeCatalog(cb) : () => {}),
    getCatalogVersion
  );

  /** English text for a field: own `en`, else the catalog's `en` */
  const englishFor = useCallback(
    (item, field) => {
      const pick = (en) => {
        if (!en) return undefined;
        if (en[field] !== undefined && en[field] !== null && en[field] !== "") return en[field];
        // deals have no `name` – their display name is the destination
        if (field === "name" && en.destination) return en.destination;
        return undefined;
      };
      return pick(item.en) ?? pick(getCatalogItem(item)?.en);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalogVersion]
  );

  /** Field of a DB item in the current language (falls back to Hebrew) */
  const tc = useCallback(
    (item, field) => {
      if (!item) return "";
      const value = item[field];
      if (!isEn) return value;
      const en = englishFor(item, field);
      if (en !== undefined) {
        // a single selected date (cart/orders) is a string while en.dates is an array
        if (field === "dates" && typeof value === "string" && Array.isArray(en)) return translateDealDate(value);
        return en;
      }
      if (field === "destination" || field === "location" || field === "name") return DESTINATION_EN[value] || value;
      if (field === "dates") return Array.isArray(value) ? value.map(translateDealDate) : translateDealDate(value);
      return value;
    },
    [isEn, englishFor]
  );

  /** Destination display name for a Hebrew destination string */
  const tDest = useCallback((name) => (isEn ? DESTINATION_EN[name] || name : name), [isEn]);

  /** A single deal date string ("15-22 מאי 2026") in the current language */
  const tDate = useCallback((text) => (isEn ? translateDealDate(text) : text), [isEn]);

  const formatDate = useCallback(
    (date, opts = { day: "2-digit", month: "2-digit", year: "numeric" }) => {
      if (!date) return "—";
      return new Intl.DateTimeFormat(locale, opts).format(new Date(date));
    },
    [locale]
  );

  const formatNumber = useCallback((n) => Number(n || 0).toLocaleString(locale), [locale]);

  return { t, i18n, lang, isEn, locale, tc, tDest, tDate, formatDate, formatNumber };
}
