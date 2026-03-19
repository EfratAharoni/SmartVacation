
import { useNavigate } from "react-router-dom";
import './Cart.css';
import React, { useState } from "react";
// תיקון: ייבוא useState

export default function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'ישראל',
    passengers: [{ name: '' }],
    payment: '',
    cardNumber: '',
    cardExp: '',
    cardCvv: '',
    agree: false,
  });
  const [formError, setFormError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFormChange = (e, idx) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('passenger')) {
      const passengers = [...form.passengers];
      passengers[idx]["name"] = value;
      setForm({ ...form, passengers });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addPassenger = () => {
    setForm({ ...form, passengers: [...form.passengers, { name: '' }] });
  };

  const removePassenger = (idx) => {
    const passengers = form.passengers.filter((_, i) => i !== idx);
    setForm({ ...form, passengers });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.country || !form.payment ||
      (form.payment === 'credit' && (!form.cardNumber || !form.cardExp || !form.cardCvv)) ||
      form.passengers.some(p => !p.name)) {
      setFormError('אנא מלא את כל השדות');
      return;
    }
    setFormError('');
    setTimeout(() => {
      setShowConfirmation(true);
    }, 1200);
  };

  return (
    <div className="checkout-fullpage-bg">
      <div className="checkout-2col-container">
        <div className="checkout-form-col">
          <button className="back-to-cart-btn" onClick={() => navigate('/cart')}>חזרה לעמוד הקניות</button>
          <form className="checkout-form" onSubmit={handlePayment}>
            <h2>מלאו את הפרטים</h2>
            <div className="form-row">
              <div className="form-group">
                <label>שם פרטי (באנגלית)</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="David" required />
              </div>
              <div className="form-group">
                <label>שם משפחה (באנגלית)</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Cohen" required />
              </div>
            </div>
            <div className="form-group">
              <label>אימייל</label>
              <input type="email" name="email" value={form.email} onChange={handleFormChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>מדינה</label>
                <select name="country" value={form.country} onChange={handleFormChange} required>
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
                <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} required />
              </div>
            </div>
            <h3>פרטי הנוסעים</h3>
            {form.passengers.map((p, idx) => (
              <div className="form-group passenger-group" key={idx}>
                <input
                  type="text"
                  name={`passenger${idx}`}
                  value={p.name}
                  onChange={e => handleFormChange(e, idx)}
                  placeholder={`נוסע ${idx + 1}`}
                  required
                />
                {form.passengers.length > 1 && (
                  <button type="button" className="remove-passenger-btn" onClick={() => removePassenger(idx)}>
                    הסר
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-passenger-btn" onClick={addPassenger}>
              הוסף נוסע
            </button>
            <h3>אמצעי תשלום</h3>
            <div className="form-group">
              <select name="payment" value={form.payment} onChange={handleFormChange} required>
                <option value="">בחר אמצעי תשלום</option>
                <option value="credit">כרטיס אשראי</option>
                <option value="paypal">PayPal</option>
                <option value="bit">Bit</option>
              </select>
            </div>
            {form.payment === 'credit' && (
              <div className="credit-fields">
                <div className="form-group">
                  <label>מספר כרטיס</label>
                  <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleFormChange} maxLength={19} placeholder="1234 5678 9012 3456" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>תוקף</label>
                    <input type="text" name="cardExp" value={form.cardExp} onChange={handleFormChange} maxLength={5} placeholder="MM/YY" required />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" name="cardCvv" value={form.cardCvv} onChange={handleFormChange} maxLength={4} placeholder="123" required />
                  </div>
                </div>
              </div>
            )}
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleFormChange} />
                אני רוצה לקבל אישור הזמנה במייל (מומלץ)
              </label>
            </div>
            <div className="form-group">
              <button type="submit" className="pay-btn">לתשלום</button>
            </div>
            {formError && <div className="form-error">{formError}</div>}
          </form>
        </div>
        <div className="checkout-summary-col">
          {/* כאן אפשר להוסיף סיכום הזמנה, פרטי עגלה, מחיר, וכו' */}
        </div>
      </div>
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="modal confirmation-modal">
            <button className="modal-close" onClick={() => setShowConfirmation(false)} title="סגור">×</button>
            <div className="confirmation-modal-content">
              <h2>הזמנתך התקבלה!</h2>
              <p className="confirmation-success">התשלום התקבל בהצלחה.</p>
              <div className="confirmation-info">
                <h4>הנה כמה דברים שכדאי לסגור עכשיו:</h4>
                <ul>
                  <li>ביטוח נסיעות</li>
                  <li>סים לחו"ל</li>
                  <li>לבדוק שהדרכון בתוקף לפחות 6 חודשים</li>
                </ul>
              </div>
              <div className="confirmation-details">
                <h4>פרטי המזמין:</h4>
                <div>שם: {form.firstName} {form.lastName}</div>
                <div>אימייל: {form.email}</div>
                <div>טלפון: {form.phone}</div>
                <div>מדינה: {form.country}</div>
                <div>נוסעים: {form.passengers.map(p => p.name).join(', ')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
