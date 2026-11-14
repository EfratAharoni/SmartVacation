import { useState } from "react";
import { createPortal } from "react-dom";
import useLocalize from "../utils/useLocalize";
import { usePreferences } from "../context/PreferencesContext";
import { DEFAULT_ATTRACTION_QTY, attractionChildPrice, calcAttractionTotal } from "../utils/pricing";

/**
 * Visitor selection for an attraction (adults / children / infants).
 * Used both when booking (Attractions) and when editing a cart item (Cart).
 */
export default function AttractionBookingModal({ attraction, initialQty, onClose, onConfirm, confirmLabel, note }) {
  const { t, tc } = useLocalize();
  const { price } = usePreferences();
  const [qty, setQty] = useState(() => ({ ...DEFAULT_ATTRACTION_QTY, ...initialQty }));

  const isFree = (attraction.price || 0) === 0;
  const childPrice = attractionChildPrice(attraction);
  const total = calcAttractionTotal(attraction, qty);
  const free = t("common.free");

  const row = (key, label, desc, min, max) => (
    <div className="attr-passenger-row">
      <div className="attr-passenger-info">
        <span className="attr-passenger-label">{label}</span>
        <span className="attr-passenger-desc">{desc}</span>
      </div>
      <div className="attr-passenger-counter">
        <button
          className="attr-counter-btn"
          onClick={() => setQty((q) => ({ ...q, [key]: Math.max(min, q[key] - 1) }))}
          disabled={qty[key] <= min}
        >
          −
        </button>
        <span className="attr-counter-val">{qty[key]}</span>
        <button
          className="attr-counter-btn"
          onClick={() => setQty((q) => ({ ...q, [key]: Math.min(max, q[key] + 1) }))}
          disabled={qty[key] >= max}
        >
          +
        </button>
      </div>
    </div>
  );

  return createPortal(
    <div className="attr-booking-overlay" onClick={onClose}>
      <div className="attr-booking-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="attr-close-btn" onClick={onClose} aria-label={t("common.close")}>
          ✕
        </button>

        <div className="attr-modal-header">
          <div className="attr-header-row">
            <div className="attr-destination-info">
              <h2 className="attr-destination">{tc(attraction, "name")}</h2>
              <div className="attr-header-chips">
                <span className="attr-header-chip">📍 {tc(attraction, "location")}</span>
                {attraction.rating && <span className="attr-header-chip">⭐ {attraction.rating}</span>}
                {attraction.duration && <span className="attr-header-chip">⏱ {tc(attraction, "duration")}</span>}
              </div>
            </div>
            <div className="attr-header-price">
              <span className="attr-header-price-label">{t("common.price")}</span>
              <span className="attr-header-price-value">{isFree ? free : price(attraction.price)}</span>
              <span className="attr-header-price-per">{t("common.perAdult")}</span>
            </div>
          </div>
        </div>

        <div className="attr-modal-body">
          <div className="attr-options-col">
            <div className="attr-section">
              <h3 className="attr-section-title">{t("booking.visitors")}</h3>
              {row(
                "adults",
                t("common.adults"),
                t("booking.attrAdultsDesc", { price: isFree ? free : t("booking.perPerson", { price: price(attraction.price) }) }),
                1,
                20
              )}
              {!isFree &&
                row("children", t("common.children"), t("booking.attrChildrenDesc", { price: price(childPrice) }), 0, 20)}
              {row("infants", t("common.infants"), t("booking.attrInfantsDesc"), 0, 10)}
            </div>
          </div>

          <div className="attr-summary-col">
            <div className="attr-price-card">
              <h3 className="attr-price-title">{t("common.priceSummary")}</h3>
              <div className="attr-price-rows">
                <div className="attr-price-row">
                  <span>{t("booking.adultsLine", { count: qty.adults, price: price(attraction.price || 0) })}</span>
                  <span>{price((attraction.price || 0) * qty.adults)}</span>
                </div>
                {qty.children > 0 && (
                  <div className="attr-price-row">
                    <span>{t("booking.childrenLine", { count: qty.children, price: price(childPrice) })}</span>
                    <span>{price(childPrice * qty.children)}</span>
                  </div>
                )}
                {qty.infants > 0 && (
                  <div className="attr-price-row">
                    <span>{t("booking.infantsTag", { count: qty.infants })}</span>
                    <span className="attr-free">{free}</span>
                  </div>
                )}
              </div>
              <div className="attr-price-divider"></div>
              <div className="attr-price-total">
                <span>{t("common.totalToPay")}</span>
                <span className="attr-price-total-amount">{total === 0 ? free : price(total)}</span>
              </div>
              <button className="attr-confirm-btn" onClick={() => onConfirm(qty, total)}>
                {confirmLabel}
              </button>
              {note && <p className="attr-price-note">{note}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
