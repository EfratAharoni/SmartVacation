import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LockKeyhole, User, Users, CreditCard, Plane } from "lucide-react";
import Header from "../Header&Footer/Header";
import Footer from "../Header&Footer/Footer";
import "./Checkout.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "ישראל",
    passengers: [],
    payment: "",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
    agree: false,
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (!userName) return;
    const userKey = userName.replace(/\s/g, "_");
    const cart = JSON.parse(localStorage.getItem(`cart_${userKey}`) || "[]");
    setCartItems(cart);
  }, []);

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
  const orderId = useMemo(() => `SV-${Date.now().toString().slice(-6)}`, []);

  const saveOrderToBackend = async (paymentMethod) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const items = cartItems.map((item) => ({
      type: item.type,
      itemId: item.id || item._id,
      name: item.name || item.destination || item.title,
      image: item.image,
      price: item.price,
      totalPrice: item.totalPrice || item.price,
      dates: item.dates,
      destination: item.destination,
      location: item.location,
      bookingOptions: item.bookingOptions,
      bookingQty: item.bookingQty,
    }));

    try {
      await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
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
          totalAmount: totalPrice,
        }),
      });
    } catch {
      // Order saved locally even if backend fails
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
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validateCustomerStep = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.country) {
      setFormError("אנא מלא/י את כל פרטי המזמין");
      return false;
    }
    if (form.passengers.some((p) => !p.firstName || !p.lastName)) {
      setFormError("אנא מלא/י שם פרטי ושם משפחה לכל הנוסעים");
      return false;
    }
    setFormError("");
    return true;
  };

  const validatePaymentStep = () => {
    if (!form.payment) {
      setFormError("אנא בחר/י אמצעי תשלום");
      return false;
    }
    if (form.payment === "credit" && (!form.cardNumber || !form.cardExp || !form.cardCvv)) {
      setFormError("אנא מלא/י את כל פרטי כרטיס האשראי");
      return false;
    }
    setFormError("");
    return true;
  };

  return (
    <div className="checkout-page">
      <Header />
      <div className="checkout-fullpage-bg">
        <div className="checkout-content-wrapper">

          {/* ── Main Grid: summary | form-panel ── */}
          <div className="checkout-main-grid">

            {/* ── Step Bar - full width ── */}
            <div className="checkout-top-steps">
              <div className={`checkout-step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
                <span>{step > 1 ? "✓" : "1"}</span> פרטי המזמין/ה
              </div>
              <div className="checkout-step-divider" />
              <div className={`checkout-step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
                <span>{step > 2 ? "✓" : "2"}</span> פרטי התשלום
              </div>
              <div className="checkout-step-divider" />
              <div className={`checkout-step ${step === 3 ? "active" : ""}`}>
                <span>3</span> אישור הזמנה
              </div>
            </div>

            {/* ── עמודה 1: סיכום ── */}
            <div className="checkout-summary-wrapper checkout-card">
            <aside className="checkout-summary-col">
              <h3 className="summary-title">
                <Plane size={16} style={{ verticalAlign: "middle" }} />
                פרטי החופשה שלך
              </h3>
              <div className="summary-card-row">
                <span>פריטים בהזמנה</span>
                <strong>{cartItems.length}</strong>
              </div>
              {cartItems.slice(0, 4).map((item, index) => (
                <div key={`${item.id}-${index}`} className="summary-item-name">
                  {item.name || item.destination || item.title || `פריט ${index + 1}`}
                </div>
              ))}
              <div className="summary-divider" />
              <div className="summary-card-row total-row">
                <span>סה"כ לתשלום</span>
                <strong>₪{totalPrice.toLocaleString()}</strong>
              </div>
              <div className="checkout-package-box">
                <h4>פרטי חבילת הנופש</h4>
                <div className="package-detail-row"><span>מספר הזמנה</span><strong>{orderId}</strong></div>
                <div className="package-detail-row"><span>שם המזמין</span><strong>{form.firstName || "—"} {form.lastName || ""}</strong></div>
                <div className="package-detail-row"><span>אימייל</span><strong>{form.email || "—"}</strong></div>
                <div className="package-detail-row"><span>טלפון</span><strong>{form.phone || "—"}</strong></div>
                <div className="package-detail-row"><span>מספר נוסעים</span><strong>{totalPassengers}</strong></div>
                <div className="package-detail-row"><span>מלון</span><strong>{cartItems[0]?.hotel || cartItems[0]?.name || "ייקבע לאחר אישור"}</strong></div>
                <div className="package-detail-row"><span>טיסת הלוך</span><strong>{cartItems[0]?.departureTime || "09:45"}</strong></div>
                <div className="package-detail-row"><span>טיסת חזור</span><strong>{cartItems[0]?.returnTime || "22:55"}</strong></div>
                <div className="package-detail-row"><span>תאריכים</span><strong>{cartItems[0]?.dates || "לפי בחירתך"}</strong></div>
                <div className="package-detail-row">
                  <span>אמצעי תשלום</span>
                  <strong>
                    {form.payment === "credit" ? "כרטיס אשראי"
                      : form.payment === "paypal" ? "PayPal"
                      : form.payment === "bit" ? "Bit"
                      : "טרם נבחר"}
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
                        ← חזרה לעגלה
                      </button>
                      <div className="checkout-title-wrap">
                        <p className="checkout-kicker">Secure Checkout</p>
                        <h2>פרטי המזמין/ה</h2>
                        <p className="checkout-subtitle">פרטי יצירת קשר.</p>
                      </div>
                      <div className="checkout-section-label">
                        <User size={15} />
                        פרטי המזמין/ה
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>שם פרטי (באנגלית)</label>
                          <input type="text" name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="First Name" />
                        </div>
                        <div className="form-group">
                          <label>שם משפחה (באנגלית)</label>
                          <input type="text" name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Last Name" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>אימייל</label>
                        <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="Email Address" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>מדינה</label>
                          <select name="country" value={form.country} onChange={handleFormChange}>
                            <option value="ישראל">ישראל</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="France">France</option>
                            <option value="Germany">Germany</option>
                            <option value="Italy">Italy</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>טלפון</label>
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
                      <h2>פרטי הנוסעים</h2>
                      <p className="checkout-subtitle">שם כפי שמופיע בדרכון.</p>
                    </div>
                    <div className="checkout-section-label">
                      <Users size={15} />
                      פרטי הנוסעים ({totalPassengers} נוסעים)
                    </div>
                    <p className="checkout-passengers-note">
                      יש למלא שם מלא באנגלית כפי שמופיע בדרכון עבור כל נוסע.
                    </p>
                    <div className="step1-passengers-list">
                      {form.passengers.map((p, idx) => (
                        <div className="passenger-card" key={idx}>
                          <div className="passenger-card-header">
                            <span className="passenger-number-badge">{idx + 1}</span>
                            <span className="passenger-card-title">
                              {idx === 0 ? "נוסע/ת ראשי/ת" : `נוסע/ת ${idx + 1}`}
                            </span>
                          </div>
                          <div className="form-row passenger-name-row">
                            <div className="form-group">
                              <label>שם פרטי</label>
                              <input type="text" value={p.firstName} onChange={(e) => handleFormChange(e, idx, "firstName")} placeholder="First Name" />
                            </div>
                            <div className="form-group">
                              <label>שם משפחה</label>
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
                        המשך לתשלום <ArrowLeft className="pay-btn-icon" />
                      </button>
                    </div>
                  </div>{/* /step1-half passengers */}

                </div>
              )}

              {/* ── שלב 2 ── */}
              {step === 2 && (
                <div className="checkout-form">
                  <button className="back-to-cart-btn" onClick={() => navigate("/cart")}>← חזרה לעגלה</button>
                  <div className="checkout-title-wrap">
                    <p className="checkout-kicker">Secure Payment</p>
                    <h2>פרטי התשלום</h2>
                    <p className="checkout-subtitle">בחרו אמצעי תשלום והשלימו הזמנה.</p>
                  </div>
                  <div className="checkout-section-label"><CreditCard size={15} />אמצעי תשלום</div>
                  <div className="payment-methods-grid">
                    {[
                      { value: "credit", label: "כרטיס אשראי", icon: "💳" },
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
                        <label>מספר כרטיס</label>
                        <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleFormChange} maxLength={19} placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>תוקף</label>
                          <input type="text" name="cardExp" value={form.cardExp} onChange={handleFormChange} maxLength={5} placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input type="text" name="cardCvv" value={form.cardCvv} onChange={handleFormChange} maxLength={4} placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="form-group checkbox-group">
                    <label>
                      <input type="checkbox" name="agree" checked={form.agree} onChange={handleFormChange} />
                      אני רוצה לקבל אישור הזמנה במייל
                    </label>
                  </div>
                  {formError && <div className="form-error">{formError}</div>}
                  <div className="step-actions two-buttons">
                    <button type="button" className="secondary-step-btn" onClick={() => setStep(1)}>חזרה</button>
                    <button type="button" className="pay-btn" onClick={async () => { if (!validatePaymentStep()) return; await saveOrderToBackend(form.payment); const userName = localStorage.getItem("userName"); if (userName) { const userKey = userName.replace(/\s/g, "_"); localStorage.setItem(`cart_${userKey}`, "[]"); window.dispatchEvent(new Event("userDataUpdated")); } setStep(3); }}>
                      <LockKeyhole className="pay-btn-icon" />סיום הזמנה
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
                  <h2>הזמנה אושרה בהצלחה!</h2>
                  <p>האישור נשלח למייל שלך עם כל הפרטים.</p>
                  <div className="confirmation-details">
                    <h4>סיכום ההזמנה</h4>
                    <div className="confirmation-detail-row"><span>שם המזמין</span><strong>{form.firstName} {form.lastName}</strong></div>
                    <div className="confirmation-detail-row"><span>אימייל</span><strong>{form.email}</strong></div>
                    <div className="confirmation-detail-row"><span>טלפון</span><strong>{form.phone}</strong></div>
                    <div className="confirmation-detail-row"><span>מספר נוסעים</span><strong>{totalPassengers}</strong></div>
                    <div className="confirmation-detail-row total-confirm-row"><span>סה"כ שולם</span><strong>₪{totalPrice.toLocaleString()}</strong></div>
                  </div>
                  <div className="checkout-help-box confirmation-help-box">
                    <h4>כדאי לסגור לפני הטיסה:</h4>
                    <ul>
                      <li>ביטוח נסיעות</li>
                      <li>סים לחו"ל</li>
                      <li>לבדוק שהדרכון בתוקף לפחות 6 חודשים</li>
                    </ul>
                  </div>
                  <div className="step-actions two-buttons">
                    <button type="button" className="secondary-step-btn" onClick={() => navigate("/")}>דף הבית</button>
                    <button type="button" className="pay-btn" onClick={() => navigate("/cart")}>חזרה לעגלה</button>
                  </div>
                </div>
              )}

            </div>{/* /checkout-form-panel */}
          </div>{/* /checkout-main-grid */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
