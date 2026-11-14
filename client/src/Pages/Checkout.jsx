import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LockKeyhole, User, Users, CreditCard, Plane } from "lucide-react";
import "./Checkout.css";
import { apiJson } from "../utils/api";
import useLocalize from "../utils/useLocalize";
import { useUserLists } from "../context/UserListsContext";
import { usePreferences } from "../context/PreferencesContext";
import useServerFeatures from "../utils/useServerFeatures";

export default function Checkout() {
  const navigate = useNavigate();
  const { t, tc, formatNumber } = useLocalize();
  const { price, isConverted } = usePreferences();
  const { cart, clearCart } = useUserLists();
  const { emailEnabled } = useServerFeatures(); // confirmation emails need an email server
  // after the order is placed the cart is emptied – keep a snapshot for the confirmation screen
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const cartItems = orderSnapshot || cart;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Israel",
    passengers: [],
    payment: "",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
    agree: false,
  });
  const [formError, setFormError] = useState("");

  const totalPassengers = useMemo(() => {
    if (cartItems.length === 0) return 1;
    const dealItems = cartItems.filter((i) => i.type === "deal");
    if (dealItems.length > 0) {
      return Math.max(
        ...dealItems.map((i) => (i.bookingOptions?.adults || 0) + (i.bookingOptions?.children || 0))
      );
    }
    const attrItems = cartItems.filter((i) => i.type === "attraction");
    if (attrItems.length > 0) {
      return Math.max(
        ...attrItems.map(
          (i) =>
            (i.bookingQty?.adults || 0) +
            (i.bookingQty?.children || 0) +
            (i.bookingQty?.infants || 0)
        )
      );
    }
    return 1;
  }, [cartItems]);

  useEffect(() => {
    if (totalPassengers > 0) {
      setForm((prev) => ({
        ...prev,
        passengers: Array.from({ length: totalPassengers }, (_, i) =>
          prev.passengers[i] || { firstName: "", lastName: "" }
        ),
      }));
    }
  }, [totalPassengers]);

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.totalPrice || item.price || 0), 0),
    [cartItems]
  );
  // Real order number comes back from the server after the order is saved
  const [orderId, setOrderId] = useState("");

  const itemDisplayName = (item) => tc(item, "name") || tc(item, "destination") || item.title;

  const saveOrderToBackend = async (paymentMethod) => {
    const items = cartItems.map((item) => ({
      type: item.type,
      itemId: item._id || item.id,
      name: item.name || item.destination || item.title,
      en: item.en ? { name: item.en.name || item.en.destination, destination: item.en.destination, location: item.en.location } : undefined,
      image: item.image,
      price: item.price,
      totalPrice: item.totalPrice || item.price,
      dates: item.dates,
      destination: item.destination,
      location: item.location,
      bookingOptions: item.bookingOptions,
      bookingQty: item.bookingQty,
    }));

    const data = await apiJson("/orders", {
        method: "POST",
        body: {
          items,
          customerInfo: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            country: form.country,
          },
          passengers: form.passengers,
          paymentMethod,
          wantsEmail: emailEnabled && form.agree,
        },
      });
    return data.order;
  };

  const completeOrder = async () => {
    if (!validatePaymentStep()) return;
    setIsSubmitting(true);
    try {
      const order = await saveOrderToBackend(form.payment);
      setOrderId(order?.orderId ? order.orderId.slice(0, 8).toUpperCase() : "");
      setOrderSnapshot(cart);
      clearCart();
      setStep(3);
    } catch (err) {
      // keep the cart so the user can retry
      setFormError(err.message || t("checkout.err.orderFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e, idx, field) => {
    const { name, value, type, checked } = e.target;
    if (idx !== undefined) {
      const passengers = form.passengers.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      );
      setForm({ ...form, passengers });
      return;
    }
    // כרטיס אשראי: ספרות בלבד + פורמט אוטומטי
    if (name === "cardNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
      setForm({ ...form, cardNumber: formatted });
      return;
    }
    // תוקף: פורמט אוטומטי MM/YY
    if (name === "cardExp") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setForm({ ...form, cardExp: formatted });
      return;
    }
    // CVV: ספרות בלבד, עד 3
    if (name === "cardCvv") {
      const digits = value.replace(/\D/g, "").slice(0, 3);
      setForm({ ...form, cardCvv: digits });
      return;
    }
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validateCustomerStep = () => {
    const englishOrHebrew = /^[a-zA-Z\u05D0-\u05EA\s''-]+$/;
    const englishOnly = /^[a-zA-Z\s''-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d+\-\s()]{7,15}$/;

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.country) {
      setFormError(t("checkout.err.fillOrderer"));
      return false;
    }
    if (!englishOrHebrew.test(form.firstName) || !englishOrHebrew.test(form.lastName)) {
      setFormError(t("checkout.err.ordererName"));
      return false;
    }
    if (!emailRegex.test(form.email)) {
      setFormError(t("checkout.err.email"));
      return false;
    }
    if (!phoneRegex.test(form.phone)) {
      setFormError(t("checkout.err.phone"));
      return false;
    }
    if (form.passengers.some((p) => !p.firstName || !p.lastName)) {
      setFormError(t("checkout.err.passengerNames"));
      return false;
    }
    for (let i = 0; i < form.passengers.length; i++) {
      const p = form.passengers[i];
      if (!englishOnly.test(p.firstName) || !englishOnly.test(p.lastName)) {
        setFormError(t("checkout.err.passengerEnglish", { n: i + 1 }));
        return false;
      }
    }
    setFormError("");
    return true;
  };

  const validatePaymentStep = () => {
    if (!form.payment) {
      setFormError(t("checkout.err.payment"));
      return false;
    }
    if (form.payment === "credit") {
      const cardDigits = form.cardNumber.replace(/\s/g, "");
      if (!cardDigits) {
        setFormError(t("checkout.err.cardDetails"));
        return false;
      }
      if (!/^\d{16}$/.test(cardDigits)) {
        setFormError(t("checkout.err.cardDigits"));
        return false;
      }
      if (!/^\d{3}$/.test(form.cardCvv)) {
        setFormError(t("checkout.err.cvv"));
        return false;
      }
      const expMatch = form.cardExp.match(/^(\d{2})\/(\d{2})$/);
      if (!expMatch) {
        setFormError(t("checkout.err.expFormat"));
        return false;
      }
      const month = parseInt(expMatch[1], 10);
      const year = 2000 + parseInt(expMatch[2], 10);
      if (month < 1 || month > 12) {
        setFormError(t("checkout.err.expMonth"));
        return false;
      }
      const now = new Date();
      const expDate = new Date(year, month, 0); // יום אחרון של חודש התוקף
      if (expDate < now) {
        setFormError(t("checkout.err.expired"));
        return false;
      }
    }
    setFormError("");
    return true;
  };

  return (
    <div className="checkout-page">
      <div className="checkout-fullpage-bg">
        <div className="checkout-content-wrapper">

          {/* ── Main Grid: summary | form-panel ── */}
          <div className="checkout-main-grid">

            {/* ── Step Bar - full width ── */}
            <div className="checkout-top-steps">
              <div className={`checkout-step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
                <span>{step > 1 ? "✓" : "1"}</span> {t("checkout.step1")}
              </div>
              <div className="checkout-step-divider" />
              <div className={`checkout-step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
                <span>{step > 2 ? "✓" : "2"}</span> {t("checkout.step2")}
              </div>
              <div className="checkout-step-divider" />
              <div className={`checkout-step ${step === 3 ? "active" : ""}`}>
                <span>3</span> {t("checkout.step3")}
              </div>
            </div>

            {/* ── עמודה 1: סיכום ── */}
            <div className="checkout-summary-wrapper checkout-card">
            <aside className="checkout-summary-col">
              <h3 className="summary-title">
                <Plane size={16} style={{ verticalAlign: "middle" }} />
                {t("checkout.yourVacation")}
              </h3>
              <div className="summary-card-row">
                <span>{t("checkout.itemsInOrder")}</span>
                <strong>{cartItems.length}</strong>
              </div>
              {cartItems.slice(0, 4).map((item, index) => (
                <div key={`${item._id || item.id}-${index}`} className="summary-item-name">
                  {itemDisplayName(item) || t("checkout.item", { n: index + 1 })}
                </div>
              ))}
              <div className="summary-divider" />
              <div className="summary-card-row total-row">
                <span>{t("checkout.total")}</span>
                <strong>{price(totalPrice)}</strong>
              </div>
              {isConverted && (
                <p className="checkout-currency-note">{t("checkout.chargedInIls", { amount: `₪${formatNumber(totalPrice)}` })}</p>
              )}
              <div className="checkout-package-box">
                <h4>{t("checkout.packageDetails")}</h4>
                <div className="package-detail-row"><span>{t("checkout.orderNumber")}</span><strong>{orderId || t("checkout.pending")}</strong></div>
                <div className="package-detail-row"><span>{t("checkout.ordererName")}</span><strong>{form.firstName || "—"} {form.lastName || ""}</strong></div>
                <div className="package-detail-row"><span>{t("common.email")}</span><strong>{form.email || "—"}</strong></div>
                <div className="package-detail-row"><span>{t("common.phone")}</span><strong>{form.phone || "—"}</strong></div>
                <div className="package-detail-row"><span>{t("checkout.passengersCount")}</span><strong>{totalPassengers}</strong></div>
                <div className="package-detail-row"><span>{t("checkout.hotel")}</span><strong>{tc(cartItems[0], "hotel") || tc(cartItems[0], "name") || t("checkout.pending")}</strong></div>
                <div className="package-detail-row"><span>{t("checkout.outbound")}</span><strong>{cartItems[0]?.flightDetails?.departure || "09:45"}</strong></div>
                <div className="package-detail-row"><span>{t("checkout.return")}</span><strong>{cartItems[0]?.flightDetails?.arrival || "22:55"}</strong></div>
                <div className="package-detail-row"><span>{t("checkout.dates")}</span><strong>{tc(cartItems[0], "dates") || t("checkout.yourChoice")}</strong></div>
                <div className="package-detail-row">
                  <span>{t("checkout.paymentMethod")}</span>
                  <strong>
                    {form.payment === "credit" ? t("common.creditCard")
                      : form.payment === "paypal" ? "PayPal"
                      : form.payment === "bit" ? "Bit"
                      : t("checkout.notSelected")}
                  </strong>
                </div>
              </div>
            </aside>
            </div>

            {/* ── עמודה 2: panel הטופס ── */}
            <div className="checkout-form-panel checkout-card">

              {/* ── שלב 1: שתי חצאים מחוברות ── */}
              {step === 1 && (
                <div className="step1-halves">

                  {/* חצי ימין: פרטי המזמין/ה */}
                  <div className="step1-half">
                    <div className="step1-half-content">
                      <button className="back-to-cart-btn" onClick={() => navigate("/cart")}>
                        <span className="flip-in-ltr" aria-hidden="true">←</span> {t("common.backToCart")}
                      </button>
                      <div className="checkout-title-wrap">
                        <p className="checkout-kicker">Secure Checkout</p>
                        <h2>{t("checkout.step1")}</h2>
                        <p className="checkout-subtitle">{t("checkout.contactDetails")}</p>
                      </div>
                      <div className="checkout-section-label">
                        <User size={15} />
                        {t("checkout.step1")}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t("checkout.firstNameEn")}</label>
                          <input type="text" name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="First Name" />
                        </div>
                        <div className="form-group">
                          <label>{t("checkout.lastNameEn")}</label>
                          <input type="text" name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Last Name" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t("common.email")}</label>
                        <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="Email Address" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t("checkout.country")}</label>
                          <select name="country" value={form.country} onChange={handleFormChange}>
                            <option value="Israel">{t("checkout.israel")}</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="France">France</option>
                            <option value="Germany">Germany</option>
                            <option value="Italy">Italy</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>{t("common.phone")}</label>
                          <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="Phone Number" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* קו מפריד */}
                  <div className="step1-separator" />

                  {/* חצי שמאל: פרטי הנוסעים */}
                  <div className="step1-half">
                    <div className="step1-half-content">
                    <div className="checkout-title-wrap">
                      <p className="checkout-kicker">&nbsp;</p>
                      <h2>{t("checkout.passengers")}</h2>
                      <p className="checkout-subtitle">{t("checkout.asInPassport")}</p>
                    </div>
                    <div className="checkout-section-label">
                      <Users size={15} />
                      {t("checkout.passengersLabel", { count: totalPassengers })}
                    </div>
                    <p className="checkout-passengers-note">
                      {t("checkout.passengersNote")}
                    </p>
                    <div className="step1-passengers-list">
                      {form.passengers.map((p, idx) => (
                        <div className="passenger-card" key={idx}>
                          <div className="passenger-card-header">
                            <span className="passenger-number-badge">{idx + 1}</span>
                            <span className="passenger-card-title">
                              {idx === 0 ? t("checkout.mainPassenger") : t("checkout.passengerN", { n: idx + 1 })}
                            </span>
                          </div>
                          <div className="form-row passenger-name-row">
                            <div className="form-group">
                              <label>{t("checkout.firstName")}</label>
                              <input type="text" value={p.firstName} onChange={(e) => handleFormChange(e, idx, "firstName")} placeholder="First Name" />
                            </div>
                            <div className="form-group">
                              <label>{t("checkout.lastName")}</label>
                              <input type="text" value={p.lastName} onChange={(e) => handleFormChange(e, idx, "lastName")} placeholder="Last Name" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    </div>{/* /step1-half-content */}
                    {formError && <div className="form-error">{formError}</div>}
                    <div className="step-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
                      <button type="button" className="pay-btn" onClick={() => { if (!validateCustomerStep()) return; setStep(2); }}>
                        {t("checkout.continueToPayment")} <ArrowLeft className="pay-btn-icon flip-in-ltr" />
                      </button>
                    </div>
                  </div>{/* /step1-half passengers */}

                </div>
              )}

              {/* ── שלב 2 ── */}
              {step === 2 && (
                <div className="checkout-form">
                  <button className="back-to-cart-btn" onClick={() => navigate("/cart")}><span className="flip-in-ltr" aria-hidden="true">←</span> {t("common.backToCart")}</button>
                  <div className="checkout-title-wrap">
                    <p className="checkout-kicker">Secure Payment</p>
                    <h2>{t("checkout.step2")}</h2>
                    <p className="checkout-subtitle">{t("checkout.choosePayment")}</p>
                  </div>
                  <div className="checkout-section-label"><CreditCard size={15} />{t("checkout.paymentMethod")}</div>
                  <div className="payment-methods-grid">
                    {[
                      { value: "credit", label: t("common.creditCard"), icon: "💳" },
                      { value: "paypal", label: "PayPal", icon: "🅿️" },
                      { value: "bit", label: "Bit", icon: "📱" },
                    ].map((method) => (
                      <label key={method.value} className={`payment-method-card ${form.payment === method.value ? "selected" : ""}`}>
                        <input type="radio" name="payment" value={method.value} checked={form.payment === method.value} onChange={handleFormChange} />
                        <span className="payment-method-icon">{method.icon}</span>
                        <span className="payment-method-label">{method.label}</span>
                      </label>
                    ))}
                  </div>
                  {form.payment === "credit" && (
                    <div className="credit-fields">
                      <div className="form-group">
                        <label>{t("checkout.cardNumber")}</label>
                        <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleFormChange} maxLength={19} placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t("checkout.expiry")}</label>
                          <input type="text" name="cardExp" value={form.cardExp} onChange={handleFormChange} maxLength={5} placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input type="text" name="cardCvv" value={form.cardCvv} onChange={handleFormChange} maxLength={4} placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}
                  {emailEnabled && (
                    <div className="form-group checkbox-group">
                      <label>
                        <input type="checkbox" name="agree" checked={form.agree} onChange={handleFormChange} />
                        {t("checkout.emailConfirmation")}
                      </label>
                    </div>
                  )}
                  {formError && <div className="form-error">{formError}</div>}
                  <div className="step-actions two-buttons">
                    <button type="button" className="secondary-step-btn" onClick={() => setStep(1)}>{t("common.back")}</button>
                    <button type="button" className="pay-btn" onClick={completeOrder} disabled={isSubmitting || cartItems.length === 0}>
                      <LockKeyhole className="pay-btn-icon" />{isSubmitting ? t("checkout.processing") : t("checkout.finish")}
                    </button>
                  </div>
                </div>
              )}

              {/* ── שלב 3 ── */}
              {step === 3 && (
                <div className="checkout-confirmation-screen">
                  <div className="confirmation-check-circle">
                    <CheckCircle2 className="confirmation-check-icon" />
                  </div>
                  <h2>{t("checkout.successTitle")}</h2>
                  {emailEnabled && form.agree && <p>{t("checkout.successText")}</p>}
                  <div className="confirmation-details">
                    <h4>{t("checkout.orderSummary")}</h4>
                    {orderId && <div className="confirmation-detail-row"><span>{t("checkout.orderNumber")}</span><strong>#{orderId}</strong></div>}
                    <div className="confirmation-detail-row"><span>{t("checkout.ordererName")}</span><strong>{form.firstName} {form.lastName}</strong></div>
                    <div className="confirmation-detail-row"><span>{t("common.email")}</span><strong>{form.email}</strong></div>
                    <div className="confirmation-detail-row"><span>{t("common.phone")}</span><strong>{form.phone}</strong></div>
                    <div className="confirmation-detail-row"><span>{t("checkout.passengersCount")}</span><strong>{totalPassengers}</strong></div>
                    <div className="confirmation-detail-row total-confirm-row"><span>{t("checkout.paid")}</span><strong>₪{formatNumber(totalPrice)}</strong></div>
                  </div>
                  <div className="checkout-help-box confirmation-help-box">
                    <h4>{t("checkout.beforeFlight")}</h4>
                    <ul>
                      <li>{t("checkout.tip1")}</li>
                      <li>{t("checkout.tip2")}</li>
                      <li>{t("checkout.tip3")}</li>
                    </ul>
                  </div>
                  <div className="step-actions two-buttons">
                    <button type="button" className="secondary-step-btn" onClick={() => navigate("/")}>{t("common.homePage")}</button>
                    <button type="button" className="pay-btn" onClick={() => navigate("/profile")}>{t("checkout.myOrders")}</button>
                  </div>
                </div>
              )}

            </div>{/* /checkout-form-panel */}
          </div>{/* /checkout-main-grid */}
        </div>
      </div>
    </div>
  );
}
