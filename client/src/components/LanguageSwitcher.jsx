import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import "./LanguageSwitcher.css";

/** Toggles the UI between Hebrew (RTL) and English (LTR) */
const LanguageSwitcher = ({ className = "", compact = false }) => {
  const { t, i18n } = useTranslation();
  const next = i18n.language === "en" ? "he" : "en";

  return (
    <button
      type="button"
      className={`lang-switcher ${className}`.trim()}
      onClick={() => i18n.changeLanguage(next)}
      aria-label={t("lang.label")}
      title={t("lang.label")}
      lang={next}
    >
      <Globe size={18} strokeWidth={1.8} aria-hidden="true" className="lang-switcher-icon" />
      <span className="lang-switcher-label">{compact ? t("lang.switchToShort") : t("lang.switchTo")}</span>
    </button>
  );
};

export default LanguageSwitcher;
