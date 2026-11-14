import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import he from "./locales/he.json";
import en from "./locales/en.json";

export const LANGS = ["he", "en"];
const STORAGE_KEY = "lang";

const readStoredLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(saved) ? saved : "he";
  } catch {
    return "he";
  }
};

/** Keep <html lang/dir> in sync so the whole page flips between RTL and LTR */
const applyDocumentLang = (lng) => {
  const lang = LANGS.includes(lng) ? lng : "he";
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
};

i18n.use(initReactI18next).init({
  resources: { he: { translation: he }, en: { translation: en } },
  lng: readStoredLang(),
  fallbackLng: "he",
  interpolation: { escapeValue: false }, // React already escapes
  returnObjects: true, // allows arrays (FAQ, reviews...) in translation files
});

applyDocumentLang(i18n.language);

i18n.on("languageChanged", (lng) => {
  applyDocumentLang(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* storage unavailable – ignore */
  }
});

export default i18n;
