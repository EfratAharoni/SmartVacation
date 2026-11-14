import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { CURRENCIES, usePreferences } from "../context/PreferencesContext";
import "./PreferencesControls.css";

/** Currency picker + light/dark toggle (shown next to the language switcher) */
export default function PreferencesControls({ className = "" }) {
  const { t } = useTranslation();
  const { currency, setCurrency, theme, toggleTheme, rates, ratesDate } = usePreferences();
  // e.g. "1 ₪ = 0.311 USD · 0.282 EUR (2026-11-13)"
  const ratesTitle = `1 ₪ = ${rates.USD?.toFixed(3)} USD · ${rates.EUR?.toFixed(3)} EUR${ratesDate ? ` (${ratesDate})` : ""}`;
  const isDark = theme === "dark";

  return (
    <div className={`prefs-controls ${className}`.trim()}>
      <label className="prefs-currency">
        <span className="visually-hidden">{t("prefs.currency")}</span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label={t("prefs.currency")}
          title={ratesTitle}
        >
          {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
            <option key={code} value={code}>
              {symbol} {code}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="prefs-theme"
        onClick={toggleTheme}
        aria-label={isDark ? t("prefs.lightMode") : t("prefs.darkMode")}
        title={isDark ? t("prefs.lightMode") : t("prefs.darkMode")}
        aria-pressed={isDark}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
