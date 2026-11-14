import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  MapPin,
  Clock3,
  CalendarDays,
  Star,
  Trash2,
  CreditCard,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Flame,
  Pencil,
} from "lucide-react";
import "./Cart.css";
import useLocalize from "../utils/useLocalize";
import { useUserLists, itemKey } from "../context/UserListsContext";
import { usePreferences } from "../context/PreferencesContext";
import DealBookingModal from "../components/DealBookingModal";
import AttractionBookingModal from "../components/AttractionBookingModal";
import ConfirmDialog from "../components/ConfirmDialog";

const Cart = () => {
  const navigate = useNavigate();
  const { t, tc } = useLocalize();
  const { price } = usePreferences();
  const { cart: cartItems, removeFromCart, clearCart, updateCartItem } = useUserLists();
  const [editingDeal, setEditingDeal] = useState(null);
  const [editingAttraction, setEditingAttraction] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const displayName = (item) => tc(item, "name") || tc(item, "destination") || item?.title || t("common.unnamed");
  const displayLocation = (item) => tc(item, "location") || tc(item, "destination") || "";
  const itemTotal = (item) => (item.totalPrice != null ? item.totalPrice : item.price || 0);
  const total = cartItems.reduce((sum, item) => sum + itemTotal(item), 0);

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <ShoppingCart className="title-icon" />
            {t("cart.title")}
          </h1>
          <p>{t("cart.itemsInCart", { count: cartItems.length })}</p>
        </div>
      </section>

      <section className="cart-content">
        <div className="cart-container">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingCart size={56} className="cart-empty-icon" aria-hidden="true" />
              <h2>{t("cart.empty")}</h2>
              <p>{t("cart.emptyHint")}</p>
              <button className="checkout-btn" onClick={() => navigate("/deals")}>
                {t("cart.continueShopping")}
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                <div className="cart-header">
                  <h2>{t("cart.myItems")}</h2>
                  <button className="clear-cart-btn" onClick={() => setConfirmClear(true)}>
                    {t("cart.clearCart")}
                  </button>
                </div>

                {cartItems.map((item, index) => (
                  <div key={`${itemKey(item)}-${item.type}-${index}`} className="cart-item">
                    <div className="item-image">
                      <img src={item.image} alt={displayName(item)} />
                      <span className="item-type-badge">
                        {item.type === "attraction" ? (
                          <MapPin className="type-badge-icon attraction-icon" />
                        ) : (
                          <Flame className="type-badge-icon deal-icon" />
                        )}
                        {item.type === "attraction" ? t("common.attraction") : t("common.deal")}
                      </span>
                    </div>

                    <div className="item-details">
                      <h3>{displayName(item)}</h3>
                      {displayLocation(item) && (
                        <p className="item-location">
                          <MapPin className="meta-icon" />
                          {displayLocation(item)}
                        </p>
                      )}
                      {item.type === "attraction" && item.duration && (
                        <p className="item-duration">
                          <Clock3 className="meta-icon" />
                          {t("cart.duration", { duration: tc(item, "duration") })}
                        </p>
                      )}
                      {item.type === "attraction" && item.bookingQty && (
                        <div className="item-booking-tags">
                          {item.bookingQty.adults > 0 && (
                            <span className="booking-tag">👤 {t("booking.adultsTag", { count: item.bookingQty.adults })}</span>
                          )}
                          {item.bookingQty.children > 0 && (
                            <span className="booking-tag">🧒 {t("booking.childrenTag", { count: item.bookingQty.children })}</span>
                          )}
                          {item.bookingQty.infants > 0 && (
                            <span className="booking-tag booking-tag-green">
                              👶 {t("booking.infantsTag", { count: item.bookingQty.infants })}
                            </span>
                          )}
                        </div>
                      )}
                      {item.type === "deal" && item.dates && (
                        <p className="item-dates">
                          <CalendarDays className="meta-icon" />
                          {tc(item, "dates")}
                        </p>
                      )}
                      {item.type === "deal" && item.bookingOptions && (
                        <div className="item-booking-tags">
                          <span className="booking-tag">
                            👥 {t("booking.adultsTag", { count: item.bookingOptions.adults })}
                            {item.bookingOptions.children > 0
                              ? ` · ${t("booking.childrenTag", { count: item.bookingOptions.children })}`
                              : ""}
                          </span>
                          {item.bookingOptions.trolley && <span className="booking-tag">🎒 {t("booking.trolley")}</span>}
                          {item.bookingOptions.suitcase && <span className="booking-tag">🧳 {t("booking.suitcase")}</span>}
                          {item.bookingOptions.transfer && <span className="booking-tag">🚌 {t("booking.transfers")}</span>}
                          {item.bookingOptions.cancellable && (
                            <span className="booking-tag booking-tag-green">{t("booking.freeCancelTag")}</span>
                          )}
                        </div>
                      )}
                      {item.rating && (
                        <div className="item-rating">
                          <span>
                            <Star className="meta-icon star-icon" />
                            {item.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="item-actions">
                      <div className="item-price">
                        <span className="price-label">{t("cart.priceLabel")}</span>
                        <span className="price-value">{itemTotal(item) === 0 ? t("common.free") : price(itemTotal(item))}</span>
                        {item.price > 0 && itemTotal(item) !== item.price && (
                          <span className="price-base-note">{t("booking.perAdultPrice", { price: price(item.price) })}</span>
                        )}
                      </div>
                      {(item.type === "deal" || item.bookingQty) && (
                        <button
                          className="edit-booking-btn"
                          onClick={() => (item.type === "deal" ? setEditingDeal(item) : setEditingAttraction(item))}
                        >
                          <Pencil className="btn-icon" />
                          {t("common.edit")}
                        </button>
                      )}
                      <button className="remove-btn" onClick={() => removeFromCart(item)}>
                        <Trash2 className="btn-icon" />
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-card">
                  <h3>{t("cart.orderSummary")}</h3>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>{t("cart.itemsCount")}</span>
                      <span>{cartItems.length}</span>
                    </div>
                    <div className="summary-row">
                      <span>{t("cart.attractionsCount")}</span>
                      <span>{cartItems.filter((i) => i.type === "attraction").length}</span>
                    </div>
                    <div className="summary-row">
                      <span>{t("cart.dealsCount")}</span>
                      <span>{cartItems.filter((i) => i.type === "deal").length}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                      <span>{t("cart.totalLabel")}</span>
                      <span className="total-price">{price(total)}</span>
                    </div>
                  </div>
                  <button className="checkout-btn" onClick={() => navigate("/checkout")}>
                    <CreditCard className="btn-icon" />
                    {t("cart.checkout")}
                  </button>
                  <div className="continue-shopping">
                    <button onClick={() => navigate("/deals")}>
                      <ArrowRight className="btn-icon flip-in-ltr" />
                      {t("cart.continueShopping")}
                    </button>
                  </div>
                </div>
                <div className="benefits-card">
                  <h4>
                    <Sparkles className="title-icon" />
                    {t("cart.benefits")}
                  </h4>
                  <ul>
                    <li><BadgeCheck className="benefit-icon" />{t("cart.benefit1")}</li>
                    <li><BadgeCheck className="benefit-icon" />{t("cart.benefit2")}</li>
                    <li><BadgeCheck className="benefit-icon" />{t("cart.benefit3")}</li>
                    <li><BadgeCheck className="benefit-icon" />{t("cart.benefit4")}</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {editingDeal && (
        <DealBookingModal
          deal={editingDeal}
          dateLabel={tc(editingDeal, "dates")}
          initialOptions={editingDeal.bookingOptions}
          onClose={() => setEditingDeal(null)}
          onConfirm={(bookingOptions, totalPrice) => {
            updateCartItem(editingDeal, { bookingOptions, totalPrice });
            setEditingDeal(null);
          }}
          confirmLabel={t("common.saveChanges")}
          note={t("booking.editNote")}
        />
      )}

      {editingAttraction && (
        <AttractionBookingModal
          attraction={editingAttraction}
          initialQty={editingAttraction.bookingQty}
          onClose={() => setEditingAttraction(null)}
          onConfirm={(bookingQty, totalPrice) => {
            updateCartItem(editingAttraction, { bookingQty, totalPrice });
            setEditingAttraction(null);
          }}
          confirmLabel={t("common.saveChanges")}
          note={t("booking.editNote")}
        />
      )}

      {confirmClear && (
        <ConfirmDialog
          message={t("cart.confirmClear")}
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            clearCart();
            setConfirmClear(false);
          }}
        />
      )}
    </div>
  );
};

export default Cart;
