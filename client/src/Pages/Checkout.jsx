
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import Header from "../Header&Footer/Header";
import Footer from "../Header&Footer/Footer";
import "./Checkout.css";

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
    passengers: [{ name: "" }],
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

  const totalPrice = useMemo(() => cartItems.reduce((sum, item) => sum + (item.price || 0), 0), [cartItems]);
  const orderId = useMemo(() => `SV-${Date.now().toString().slice(-6)}`, []);

  const handleFormChange = (e, idx) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("passenger")) {
      const passengers = [...form.passengers];
      passengers[idx].name = value;
      setForm({ ...form, passengers });
      return;
    }
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const addPassenger = () => setForm({ ...form, passengers: [...form.passengers, { name: "" }] });
  const removePassenger = (idx) => setForm({ ...form, passengers: form.passengers.filter((_, i) => i !== idx) });

  const validateCustomerStep = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.country || form.passengers.some((p) => !p.name)) {
      setFormError("אנא מלא/י את כל שדות פרטי המזמין והנוסעים");
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
        <div className="checkout-top-steps">
          <div className={`checkout-step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}><span>1</span> פרטי המזמין/ה</div>
          <div className={`checkout-step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}><span>2</span> פרטי התשלום</div>
          <div className={`checkout-step ${step === 3 ? "active" : ""}`}><span>3</span> אישור הזמנה</div>
        </div>

        <div className="checkout-2col-container">
          <aside className="checkout-summary-col">
            <h3 className="summary-title">פרטי החופשה שלך</h3>
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
              <strong>₪{totalPrice}</strong>
            </div>

            <div className="checkout-package-box">
              <h4>פרטי חבילת הנופש</h4>
              <div className="package-detail-row">
                <span>מספר הזמנה</span>
                <strong>{orderId}</strong>
              </div>
              <div className="package-detail-row">
                <span>שם המזמין</span>
                <strong>{form.firstName || "First Name"} {form.lastName || "Last Name"}</strong>
              </div>
              <div className="package-detail-row">
                <span>אימייל</span>
                <strong>{form.email || "Email Address"}</strong>
              </div>
              <div className="package-detail-row">
                <span>טלפון</span>
                <strong>{form.phone || "Phone Number"}</strong>
              </div>
              <div className="package-detail-row">
                <span>מספר נוסעים</span>
                <strong>{form.passengers.length}</strong>
              </div>
              <div className="package-detail-row">
                <span>מלון</span>
                <strong>{cartItems[0]?.hotel || cartItems[0]?.name || "ייקבע לאחר אישור"}</strong>
              </div>
              <div className="package-detail-row">
                <span>טיסת הלוך</span>
                <strong>{cartItems[0]?.departureTime || "09:45"}</strong>
              </div>
              <div className="package-detail-row">
                <span>טיסת חזור</span>
                <strong>{cartItems[0]?.returnTime || "22:55"}</strong>
              </div>
              <div className="package-detail-row">
                <span>תאריכים</span>
                <strong>{cartItems[0]?.dates || "לפי בחירתך"}</strong>
              </div>
              <div className="package-detail-row">
                <span>אמצעי תשלום</span>
                <strong>{form.payment === "credit" ? "כרטיס אשראי" : form.payment === "paypal" ? "PayPal" : form.payment === "bit" ? "Bit" : "טרם נבחר"}</strong>
              </div>
            </div>
          </aside>

          <section className="checkout-form-col">
            <button className="back-to-cart-btn" onClick={() => navigate("/cart")}>חזרה לעמוד הקניות</button>
            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <>
                  <div className="checkout-title-wrap">
                    <p className="checkout-kicker">Secure Checkout</p>
                    <h2>פרטי המזמין/ה</h2>
                    <p className="checkout-subtitle">מלאו את פרטי ההתקשרות והנוסעים.</p>
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
                  <h3>פרטי הנוסעים</h3>
                  {form.passengers.map((p, idx) => (
                    <div className="form-group passenger-group" key={idx}>
                      <input type="text" name={`passenger${idx}`} value={p.name} onChange={(e) => handleFormChange(e, idx)} placeholder={`Passenger ${idx + 1}`} />
                      {form.passengers.length > 1 && (
                        <button type="button" className="remove-passenger-btn" onClick={() => removePassenger(idx)}>
                          הסר
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="add-passenger-btn" onClick={addPassenger}>הוסף נוסע</button>
                  <div className="step-actions">
                    <button
                      type="button"
                      className="pay-btn"
                      onClick={() => {
                        if (!validateCustomerStep()) return;
                        setStep(2);
                      }}
                    >
                      המשך לתשלום <ArrowLeft className="pay-btn-icon" />
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                <div className="checkout-title-wrap">
                  <p className="checkout-kicker">Secure Payment</p>
                  <h2>פרטי התשלום</h2>
                  <p className="checkout-subtitle">בחרו אמצעי תשלום והשלימו הזמנה.</p>
                </div>
                <div className="form-group">
                  <label>אמצעי תשלום</label>
                  <select name="payment" value={form.payment} onChange={handleFormChange}>
                    <option value="">בחר אמצעי תשלום</option>
                    <option value="credit">כרטיס אשראי</option>
                    <option value="paypal">PayPal</option>
                    <option value="bit">Bit</option>
                  </select>
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
                  <div className="step-actions two-buttons">
                    <button type="button" className="secondary-step-btn" onClick={() => setStep(1)}>חזרה</button>
                  <button
                    type="button"
                    className="pay-btn"
                    onClick={() => {
                      if (!validatePaymentStep()) return;
                      setStep(3);
                    }}
                  >
                    <LockKeyhole className="pay-btn-icon" />
                    סיום הזמנה
                  </button>
                </div>
                </>
              )}

              {step === 3 && (
                <div className="checkout-confirmation-screen">
                  <CheckCircle2 className="confirmation-check-icon" />
                  <h2>הזמנה אושרה בהצלחה</h2>
                  <p>האישור נשלח למייל שלך עם כל הפרטים.</p>
                  <div className="confirmation-details">
                    <h4>סיכום מזמין:</h4>
                    <div>שם: {form.firstName} {form.lastName}</div>
                    <div>אימייל: {form.email}</div>
                    <div>טלפון: {form.phone}</div>
                    <div>סה"כ לתשלום: ₪{totalPrice}</div>
                  </div>
                  <div className="checkout-help-box confirmation-help-box">
                    <h4>הנה כמה דברים שכדאי לסגור עכשיו:</h4>
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

              {formError && <div className="form-error">{formError}</div>}
            </form>
          </section>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
