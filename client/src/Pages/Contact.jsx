import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./Contact.css";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "נא להזין שם מלא";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "שם חייב להכיל לפחות 2 תווים";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "נא להזין כתובת אימייל";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "כתובת אימייל לא תקינה";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "נא להזין מספר טלפון";
    } else if (!/^0\d{1,2}-?\d{7}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "מספר טלפון לא תקין";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "נא להזין הודעה";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "ההודעה חייבת להכיל לפחות 10 תווים";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Contact form data:", formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 2000);
  };

  const faqItems = [
    {
      question: "מה זמני התגובה שלכם",
      answer:
        ".אנחנו עונים לכל הפניות תוך 24 שעות בימי עסקים. בשבתות ובחגים העסק סגור",
    },
    {
      question: "האם אפשר לבטל או לשנות הזמנה",
      answer:
        ".כן, ניתן לבטל או לשנות הזמנה בהתאם לתנאי הביטול של כל חבילה. צור איתנו קשר ונשמח לעזור",
    },
    {
      question: "האם המחירים כוללים מיסים",
      answer:
        '.כן, כל המחירים המוצגים באתר כוללים מע"מ ומיסים. אין עלויות נסתרות',
    },
    {
      question: "איך מתבצע התשלום",
      answer:
        "ניתן לשלם בכרטיס אשראי, העברה בנקאית או במזומן במשרדנו. התשלום מאובטח ומוצפן",
    },
  ];

  return (
    <div className="contact-page" dir="rtl">

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1 className="floating">נשמח לשמוע ממך</h1>
          <p>יש לך שאלה, רעיון או הצעה? אנחנו כאן בשבילך</p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="main-contact-section">
        <div className="contact-container">
          {/* Left Column */}
          <div className="left-column">
            {/* Contact Form */}

            <div className="contact-form-wrapper">
              <div className="form-header">
                <h2>שלח לנו הודעה</h2>
                <p>מלא את הפרטים ונחזור אליך בהקדם</p>
              </div>

              {submitSuccess && (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  <div>
                    <h4>ההודעה נשלחה בהצלחה!</h4>
                    <p>נחזור אליך בהקדם האפשרי</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">שם מלא *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="הזן שם מלא"
                      className={errors.name ? "error" : ""}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">אימייל *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="הזן כתובת אימייל"
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">טלפון *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="הזן מספר טלפון"
                      className={errors.phone ? "error" : ""}
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">נושא</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="general">פנייה כללית</option>
                      <option value="booking">הזמנה חדשה</option>
                      <option value="support">תמיכה טכנית</option>
                      <option value="complaint">תלונה</option>
                      <option value="suggestion">הצעה/רעיון</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">הודעה *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="ספר לנו במה נוכל לעזור..."
                    rows="6"
                    className={errors.message ? "error" : ""}
                  ></textarea>
                  {errors.message && (
                    <span className="error-message">{errors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${isSubmitting ? "loading" : ""}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      שולח...
                    </>
                  ) : (
                    <>
                      שלח הודעה
                      <span className="send-icon"></span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="info-card contact-details-card">
              <h3>צור קשר</h3>
              <div className="contact-details-list">
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>אימייל</span>
                  <a href="mailto:info@smartvacation.co.il">
                    info@smartvacation.co.il
                  </a>
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>טלפון</span>
                  <a href="tel:0312345678">03-1234567</a>
                </div>
                <div className="contact-item">
                  <FaWhatsapp className="contact-icon" />
                  <span>WhatsApp</span>
                  <a
                    href="https://wa.me/9720501234567"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    050-1234567
                  </a>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>כתובת</span>
                  <span>דרך מנחם בגין 125, תל אביב</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="info-card">
              <h3>שעות פעילות</h3>
              <div className="hours-list">
                <div className="hours-item">
                  <span>ראשון - חמישי</span>
                  <span>09:00 - 18:00</span>
                </div>
                <div className="hours-item">
                  <span>שישי</span>
                  <span>09:00 - 13:00</span>
                </div>
                <div className="hours-item">
                  <span>שבתות וחגים</span>
                  <span>סגור</span>
                </div>
                <div className="hours-notice">
                     שימו לב: לא ניתן מענה מחוץ לשעות הפעילות
                </div>

              </div>
            </div>

            <div className="info-card">
              <h3>מיקום המשרד</h3>
              <div className="map-placeholder">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.7272469371564!2d34.78847731516893!3d32.07417908119073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4ca6193b7c1f%3A0xc9e8c1f8f1b1b1b1!2z15DXkdeg15XXoNeV15g!5e0!3m2!1siw!2sil!4v1234567890123!5m2!1siw!2sil"
                  width="100%"
                  height="200"
                  style={{ border: 0, borderRadius: "12px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <p className="address-text">
                דרך מנחם בגין 125
                <br />
                תל אביב, ישראל
              </p>
            </div>

            <div className="info-card social-card">
              <h3>עקוב אחרינו</h3>
              <div className="social-links-formal">
                <a
                  href="https://wa.me/9720501234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-icon"
                >
                  <FaWhatsapp />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-icon"
                >
                  <FaInstagram />
                  <span>Instagram</span>
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-icon"
                >
                  <FaFacebook />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-container">
          <h2 className="section-title">שאלות נפוצות</h2>
          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-card">
                <div className="faq-question">
                  <span className="faq-icon">❓</span>
                  <h3>{item.question}</h3>
                </div>
                <p className="faq-answer">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
