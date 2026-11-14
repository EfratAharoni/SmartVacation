import { useState } from "react";
import { X, Upload } from "lucide-react";
import { apiFetch } from "../utils/api";
import { translateDealDate } from "../utils/destinations";

/**
 * Friendly add/edit form for deals & attractions.
 * Each text field has a Hebrew input and (where it is shown to users) an English input,
 * so the item appears correctly in both languages.
 */

const DEAL_CATEGORIES = ["europe", "asia", "america"];
const ATTRACTION_CATEGORIES = ["landmarks", "museums", "nature", "temples", "sports"];

// list fields are edited as "one item per line"
const toLines = (arr) => (Array.isArray(arr) ? arr.join("\n") : "");
const fromLines = (text) =>
  String(text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);


const dealToForm = (d) => ({
  destination: d.destination || "",
  destination_en: d.en?.destination || "",
  image: d.image || "/images/",
  category: d.category || "europe",
  price: d.price ?? "",
  originalPrice: d.originalPrice ?? "",
  rating: d.rating ?? 4.5,
  reviewsCount: d.reviewsCount ?? 0,
  airline: d.airline || "",
  airline_en: d.en?.airline || "",
  flightTime: d.flightTime || "",
  flightTime_en: d.en?.flightTime || "",
  departure: d.flightDetails?.departure || "",
  arrival: d.flightDetails?.arrival || "",
  flightClass: d.flightDetails?.class || "תיירים",
  flightClass_en: d.en?.flightClass || "Economy",
  hotel: d.hotel || "",
  hotel_en: d.en?.hotel || "",
  hotelName: d.hotelName || "",
  dates: toLines(d.dates),
  included: toLines(d.included),
  included_en: toLines(d.en?.included),
  attractions: toLines(d.attractions),
  attractions_en: toLines(d.en?.attractions),
  isKosherFriendly: !!d.isKosherFriendly,
});

const formToDeal = (f) => {
  const price = Number(f.price) || 0;
  const originalPrice = Number(f.originalPrice) || price;
  const dates = fromLines(f.dates);
  return {
    destination: f.destination.trim(),
    image: f.image.trim(),
    category: f.category,
    price,
    originalPrice,
    discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    rating: Number(f.rating) || 0,
    reviewsCount: Number(f.reviewsCount) || 0,
    airline: f.airline.trim(),
    flightTime: f.flightTime.trim(),
    flightDetails: { departure: f.departure, arrival: f.arrival, class: f.flightClass.trim() },
    hotel: f.hotel.trim(),
    hotelName: f.hotelName.trim(),
    dates,
    included: fromLines(f.included),
    attractions: fromLines(f.attractions),
    isKosherFriendly: f.isKosherFriendly,
    en: {
      destination: f.destination_en.trim(),
      airline: f.airline_en.trim() || f.airline.trim(),
      flightTime: f.flightTime_en.trim(),
      flightClass: f.flightClass_en.trim(),
      hotel: f.hotel_en.trim(),
      hotelName: f.hotelName.trim(),
      included: fromLines(f.included_en),
      attractions: fromLines(f.attractions_en),
      dates: dates.map(translateDealDate), // dates are translated automatically
    },
  };
};

const attractionToForm = (a) => ({
  name: a.name || "",
  name_en: a.en?.name || "",
  location: a.location || "",
  location_en: a.en?.location || "",
  image: a.image || "/images/",
  category: a.category || "landmarks",
  price: a.price ?? "",
  childPrice: a.childPrice ?? "",
  rating: a.rating ?? 4.5,
  duration: a.duration || "",
  duration_en: a.en?.duration || "",
  description: a.description || "",
  description_en: a.en?.description || "",
  highlights: toLines(a.highlights),
  highlights_en: toLines(a.en?.highlights),
});

const formToAttraction = (f) => ({
  name: f.name.trim(),
  location: f.location.trim(),
  image: f.image.trim(),
  category: f.category,
  price: Number(f.price) || 0,
  ...(f.childPrice !== "" ? { childPrice: Number(f.childPrice) } : {}),
  rating: Number(f.rating) || 0,
  duration: f.duration.trim(),
  description: f.description.trim(),
  highlights: fromLines(f.highlights),
  en: {
    name: f.name_en.trim(),
    location: f.location_en.trim(),
    duration: f.duration_en.trim(),
    description: f.description_en.trim(),
    highlights: fromLines(f.highlights_en),
  },
});

export default function AdminItemForm({ type, item, onClose, onSave, t }) {
  const isDeal = type === "deals";
  const [form, setForm] = useState(() => (isDeal ? dealToForm(item) : attractionToForm(item)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  /** Upload an image file to the server; the returned URL goes into the image field */
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await apiFetch("/uploads", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t("common.networkError"));
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = isDeal ? formToDeal(form) : formToAttraction(form);
    if (isDeal && data.dates.length === 0) {
      setError(t("admin.form.datesRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(data);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  /* ── small field helpers ── */
  const text = ({ name, label, required, type: inputType = "text", dir, placeholder, ...rest }) => (
    // called as a function (not <Text/>) so inputs keep focus while typing
    <label className="af-field" key={name}>
      <span>
        {label}
        {required && <b className="af-req"> *</b>}
      </span>
      <input
        type={inputType}
        value={form[name]}
        onChange={set(name)}
        required={required}
        dir={dir}
        placeholder={placeholder}
        {...rest}
      />
    </label>
  );

  /** Hebrew + English inputs side by side */
  const pair = ({ name, label, required, multiline, rows = 3, hint }) => (
    <div className="af-pair" key={name}>
      <div className="af-pair-label">
        {label}
        {required && <b className="af-req"> *</b>}
        {hint && <small className="af-hint">{hint}</small>}
      </div>
      <div className="af-pair-inputs">
        <label className="af-field">
          <span className="af-lang">עברית</span>
          {multiline ? (
            <textarea dir="rtl" rows={rows} value={form[name]} onChange={set(name)} required={required} />
          ) : (
            <input dir="rtl" value={form[name]} onChange={set(name)} required={required} />
          )}
        </label>
        <label className="af-field">
          <span className="af-lang">English</span>
          {multiline ? (
            <textarea dir="ltr" rows={rows} value={form[`${name}_en`]} onChange={set(`${name}_en`)} />
          ) : (
            <input dir="ltr" value={form[`${name}_en`]} onChange={set(`${name}_en`)} />
          )}
        </label>
      </div>
    </div>
  );

  const linesHint = t("admin.form.onePerLine");

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <form
        className="admin-modal af-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="admin-modal-head">
          <h3>
            {item._id ? t("admin.editItem") : isDeal ? t("admin.form.newDeal") : t("admin.form.newAttraction")}
          </h3>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label={t("common.close")}>
            <X size={18} />
          </button>
        </div>
        <p className="admin-hint">{t("admin.form.intro")}</p>

        <div className="af-body">
          {/* ── Basic details ── */}
          <fieldset className="af-section">
            <legend>{t("admin.form.basic")}</legend>
            {isDeal ? (
              pair({ name: "destination", label: t("admin.form.destination"), required: true, hint: t("admin.form.destinationHint") })
            ) : (
              <>
                {pair({ name: "name", label: t("admin.form.attractionName"), required: true })}
                {pair({ name: "location", label: t("admin.form.location"), required: true, hint: t("admin.form.locationHint") })}
              </>
            )}
            <div className="af-row">
              <label className="af-field">
                <span>{t("admin.category")}</span>
                <select value={form.category} onChange={set("category")}>
                  {(isDeal ? DEAL_CATEGORIES : ATTRACTION_CATEGORIES).map((c) => (
                    <option key={c} value={c}>
                      {t(`admin.form.cat.${c}`, { defaultValue: c })}
                    </option>
                  ))}
                </select>
              </label>
              {text({ name: "rating", label: t("admin.rating"), type: "number", min: "0", max: "5", step: "0.1" })}
              {isDeal && text({ name: "reviewsCount", label: t("admin.form.reviewsCount"), type: "number", min: "0" })}
            </div>
            <div className="af-image-row">
              {text({ name: "image", label: t("admin.image"), required: true, dir: "ltr", placeholder: "/images/paris.jpg" })}
              {form.image && form.image !== "/images/" && (
                <img src={form.image} alt="" className="af-preview" onError={(e) => (e.currentTarget.style.opacity = 0.2)} />
              )}
              <label className={`admin-btn ghost af-upload ${uploading ? "is-loading" : ""}`}>
                <Upload size={16} aria-hidden="true" />
                {uploading ? t("admin.form.uploading") : t("admin.form.upload")}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={uploadImage} hidden disabled={uploading} />
              </label>
            </div>
            <small className="af-hint">{t("admin.form.imageHint")}</small>
          </fieldset>

          {/* ── Prices ── */}
          <fieldset className="af-section">
            <legend>{t("admin.form.prices")}</legend>
            <div className="af-row">
              {text({ name: "price", label: isDeal ? t("admin.form.dealPrice") : t("admin.form.adultPrice"), type: "number", min: "0", required: true })}
              {isDeal ? (
                text({ name: "originalPrice", label: t("admin.form.originalPrice"), type: "number", min: "0" })
              ) : (
                text({ name: "childPrice", label: t("admin.form.childPrice"), type: "number", min: "0", placeholder: t("admin.form.childPriceHint") })
              )}
            </div>
            {isDeal && Number(form.originalPrice) > Number(form.price) && (
              <small className="af-hint">
                {t("admin.form.discountAuto", {
                  pct: Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100),
                })}
              </small>
            )}
          </fieldset>

          {isDeal ? (
            <>
              {/* ── Dates ── */}
              <fieldset className="af-section">
                <legend>{t("admin.form.dates")}</legend>
                <label className="af-field">
                  <span>
                    {t("admin.form.datesLabel")} <b className="af-req">*</b>
                  </span>
                  <textarea dir="rtl" rows={3} value={form.dates} onChange={set("dates")} placeholder="15-22 מאי 2027" />
                </label>
                <small className="af-hint">{t("admin.form.datesHint")}</small>
              </fieldset>

              {/* ── Flight ── */}
              <fieldset className="af-section">
                <legend>{t("admin.form.flight")}</legend>
                {pair({ name: "airline", label: t("admin.form.airline"), required: true })}
                {pair({ name: "flightTime", label: t("admin.form.flightTime"), hint: "4 שעות / 4 hours" })}
                <div className="af-row">
                  {text({ name: "departure", label: t("admin.form.departure"), type: "time" })}
                  {text({ name: "arrival", label: t("admin.form.arrival"), type: "time" })}
                </div>
                {pair({ name: "flightClass", label: t("admin.form.flightClass") })}
              </fieldset>

              {/* ── Hotel ── */}
              <fieldset className="af-section">
                <legend>{t("admin.form.hotel")}</legend>
                {text({ name: "hotelName", label: t("admin.form.hotelName"), dir: "ltr", placeholder: "Hilton Berlin" })}
                {pair({ name: "hotel", label: t("admin.form.hotelType"), required: true, hint: "מלון 4 כוכבים / 4-star hotel" })}
              </fieldset>

              {/* ── Package contents ── */}
              <fieldset className="af-section">
                <legend>{t("admin.form.contents")}</legend>
                {pair({ name: "included", label: t("admin.form.included"), multiline: true, hint: linesHint })}
                {pair({ name: "attractions", label: t("admin.form.attractions"), multiline: true, hint: linesHint })}
                <label className="af-check">
                  <input type="checkbox" checked={form.isKosherFriendly} onChange={set("isKosherFriendly")} />
                  {t("admin.form.kosher")}
                </label>
              </fieldset>
            </>
          ) : (
            <fieldset className="af-section">
              <legend>{t("admin.form.details")}</legend>
              {pair({ name: "duration", label: t("admin.form.duration"), hint: "2-3 שעות / 2-3 hours" })}
              {pair({ name: "description", label: t("admin.form.description"), multiline: true })}
              {pair({ name: "highlights", label: t("admin.form.highlights"), multiline: true, hint: linesHint })}
            </fieldset>
          )}
        </div>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn ghost" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button type="submit" className="admin-btn" disabled={saving}>
            {t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
