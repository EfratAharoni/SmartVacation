import { useState } from "react";
import { CalendarDays, Hotel, PlaneTakeoff } from "lucide-react";
import useLocalize from "../utils/useLocalize";
import { usePreferences } from "../context/PreferencesContext";
import {
  DEFAULT_DEAL_OPTIONS,
  SUITCASE,
  TRANSFER_PER_PERSON,
  TROLLEY,
  calcDealTotal,
  dealAdultPrice,
  dealChildPrice,
  EXTRA_CANCELLABLE,
} from "../utils/pricing";

/**
 * Booking options for a deal (passengers, luggage, transfers, cancellation).
 * Used both when booking (DealDetails) and when editing a cart item (Cart).
 */
export default function DealBookingModal({ deal, dateLabel, initialOptions, onClose, onConfirm, confirmLabel, note }) {
  const { t, tc } = useLocalize();
  const { price } = usePreferences();
  const [opts, setOpts] = useState(() => ({ ...DEFAULT_DEAL_OPTIONS, ...initialOptions }));
  const set = (patch) => setOpts((p) => ({ ...p, ...patch }));

  const total = calcDealTotal(deal.price, opts);
  const adult = dealAdultPrice(deal.price, opts);
  const child = dealChildPrice(deal.price, opts);

  const counter = (key, min, max) => (
    <div className="passenger-counter">
      <button className="counter-btn" onClick={() => set({ [key]: Math.max(min, opts[key] - 1) })} disabled={opts[key] <= min}>
        −
      </button>
      <span className="counter-value">{opts[key]}</span>
      <button className="counter-btn" onClick={() => set({ [key]: Math.min(max, opts[key] + 1) })} disabled={opts[key] >= max}>
        +
      </button>
    </div>
  );

  const toggleRow = (key, icon, name, priceText) => (
    <div className="booking-option-row">
      <span className="booking-option-icon">{icon}</span>
      <div className="booking-option-info">
        <span className="booking-option-name">{name}</span>
        <span className="booking-option-price">{priceText}</span>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={opts[key]} onChange={(e) => set({ [key]: e.target.checked })} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );

  return (
    <div className="deal-modal-overlay" onClick={onClose}>
      <div className="booking-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="deal-close-btn booking-close-btn" onClick={onClose} aria-label={t("common.close")}>
          ✕
        </button>

        {/* Header */}
        <div className="booking-modal-header">
          <div className="booking-header-row">
            <div className="booking-destination-info">
              <h2 className="booking-destination">{tc(deal, "destination")}</h2>
              <div className="booking-header-chips">
                <span className="booking-header-chip">
                  <PlaneTakeoff size={13} /> {tc(deal, "airline")}
                </span>
                <span className="booking-header-chip">
                  <Hotel size={13} /> {tc(deal, "hotelName") || tc(deal, "hotel")}
                </span>
                {dateLabel && (
                  <span className="booking-header-chip">
                    <CalendarDays size={13} /> {dateLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="booking-header-price">
              <span className="booking-header-price-label">{t("common.fromShort")}</span>
              <span className="booking-header-price-value">{price(deal.price)}</span>
              <span className="booking-header-price-per">{t("common.perAdult")}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="booking-modal-body">
          <div className="booking-options-col">
            <div className="booking-section">
              <h3 className="booking-section-title">{t("booking.passengers")}</h3>
              <div className="passenger-row">
                <div className="passenger-info">
                  <span className="passenger-label">{t("common.adults")}</span>
                  <span className="passenger-desc">{t("booking.adultsAge")}</span>
                </div>
                {counter("adults", 1, 9)}
              </div>
              <div className="passenger-row">
                <div className="passenger-info">
                  <span className="passenger-label">{t("common.children")}</span>
                  <span className="passenger-desc">{t("booking.childrenAge")}</span>
                </div>
                {counter("children", 0, 6)}
              </div>
            </div>

            <div className="booking-section">
              <h3 className="booking-section-title">{t("booking.luggage")}</h3>
              <p className="booking-section-subtitle">{t("booking.luggageSub")}</p>
              {toggleRow("trolley", "🎒", t("booking.trolley"), t("booking.trolleyPrice", { price: price(TROLLEY) }))}
              {toggleRow("suitcase", "🧳", t("booking.suitcase"), t("booking.suitcasePrice", { price: price(SUITCASE) }))}
            </div>

            <div className="booking-section">
              <h3 className="booking-section-title">{t("booking.transfers")}</h3>
              {toggleRow("transfer", "🚌", t("booking.transferService"), t("booking.transferPrice", { price: price(TRANSFER_PER_PERSON) }))}
            </div>

            <div className="booking-section">
              <h3 className="booking-section-title">{t("booking.terms")}</h3>
              <label className="cancellation-option-row">
                <input type="radio" checked={!opts.cancellable} onChange={() => set({ cancellable: false })} />
                <div className="cancellation-option-info">
                  <span className="cancellation-option-name">{t("booking.nonRefundable")}</span>
                  <span className="cancellation-option-price">{t("booking.perAdultPrice", { price: price(deal.price) })}</span>
                </div>
              </label>
              <label className="cancellation-option-row">
                <input type="radio" checked={opts.cancellable} onChange={() => set({ cancellable: true })} />
                <div className="cancellation-option-info">
                  <span className="cancellation-option-name">{t("booking.freeCancel")}</span>
                  <span className="cancellation-option-price cancellation-free">
                    {t("booking.perAdultPrice", { price: price(deal.price + EXTRA_CANCELLABLE) })}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Price summary */}
          <div className="booking-summary-col">
            <div className="price-summary-card">
              <h3 className="price-summary-title">{t("common.priceSummary")}</h3>
              <div className="price-summary-rows">
                <div className="price-summary-row">
                  <span>{t("booking.adultsLine", { count: opts.adults, price: price(adult) })}</span>
                  <span>{price(adult * opts.adults)}</span>
                </div>
                {opts.children > 0 && (
                  <div className="price-summary-row">
                    <span>{t("booking.childrenLine", { count: opts.children, price: price(child) })}</span>
                    <span>{price(child * opts.children)}</span>
                  </div>
                )}
                {opts.trolley && (
                  <div className="price-summary-row">
                    <span>{t("booking.trolleyLine")}</span>
                    <span>{price(TROLLEY)}</span>
                  </div>
                )}
                {opts.suitcase && (
                  <div className="price-summary-row">
                    <span>{t("booking.suitcaseLine")}</span>
                    <span>{price(SUITCASE)}</span>
                  </div>
                )}
                {opts.transfer && (
                  <div className="price-summary-row">
                    <span>{t("booking.transferLine", { count: opts.adults + opts.children })}</span>
                    <span>{price(TRANSFER_PER_PERSON * (opts.adults + opts.children))}</span>
                  </div>
                )}
              </div>
              <div className="price-summary-divider"></div>
              <div className="price-summary-total">
                <span>{t("common.totalToPay")}</span>
                <span className="price-summary-total-amount">{price(total)}</span>
              </div>
              <button className="btn-confirm-booking" onClick={() => onConfirm(opts, total)}>
                {confirmLabel}
              </button>
              {note && <p className="booking-note">{note}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
