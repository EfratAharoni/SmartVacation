import React, { useState } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./Contact.css";
import { apiJson } from "../utils/api";
import useLocalize from "../utils/useLocalize";

const Contact = () => {
  const { t } = useLocalize();
  const [submitError, setSubmitError] = useState("");
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
      newErrors.name = t("contact.err.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("contact.err.nameShort");
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = t("contact.err.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("contact.err.emailInvalid");
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = t("contact.err.phoneRequired");
    } else if (!/^(0\d{1,2}-?\d{7}|\+?[\d\s\-()]{7,20})$/.test(formData.phone.replace(/\s/g, ""))) {
      // Israeli format, or an international number
      newErrors.phone = t("contact.err.phoneInvalid");
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = t("contact.err.messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("contact.err.messageShort");
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
    setSubmitError("");

    try {
      await apiJson("/contact", {
        method: "POST",
        body: { ...formData, subject: formData.subject },
      });
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "general", message: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError(err.message || t("common.networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = t("contact.faqItems", { returnObjects: true }) || [];

  return (
    <div className="contact-page">

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1 className="floating">{t("contact.heroTitle")}</h1>
          <p>{t("contact.heroSubtitle")}</p>
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
                <h2>{t("contact.sendUs")}</h2>
                <p>{t("contact.fillDetails")}</p>
              </div>

              {submitSuccess && (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  <div>
                    <h4>{t("contact.successTitle")}</h4>
                    <p>{t("contact.successText")}</p>
                  </div>
                </div>
              )}
              {submitError && (
                <div className="error-message" role="alert" style={{ marginBottom: "1rem" }}>{submitError}</div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{t("contact.nameLabel")}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("contact.namePlaceholder")}
                      className={errors.name ? "error" : ""}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">{t("contact.emailLabel")}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contact.emailPlaceholder")}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">{t("contact.phoneLabel")}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("contact.phonePlaceholder")}
                      className={errors.phone ? "error" : ""}
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">{t("contact.subject")}</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      {["general", "booking", "support", "complaint", "suggestion"].map((s) => (
                        <option key={s} value={s}>{t(`contact.subjects.${s}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t("contact.messageLabel")}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("contact.messagePlaceholder")}
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
                      {t("contact.sending")}
                    </>
                  ) : (
                    <>
                      {t("contact.send")}
                      <span className="send-icon"></span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="info-card contact-details-card">
              <h3>{t("contact.contactUs")}</h3>
              <div className="contact-details-list">
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <span>{t("common.email")}</span>
                  <a href="mailto:info@smartvacation.co.il">
                    info@smartvacation.co.il
                  </a>
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>{t("common.phone")}</span>
                  <a href="tel:036134587">03-6134587</a>
                </div>
                <div className="contact-item">
                  <FaWhatsapp className="contact-icon" />
                  <span>WhatsApp</span>
                  <a
                    href="https://wa.me/9720502232567"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    050-2232567
                  </a>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>{t("contact.address")}</span>
                  <span>{t("contact.addressValue")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="info-card">
              <h3>{t("contact.hours")}</h3>
              <div className="hours-list">
                <div className="hours-item">
                  <span>{t("contact.sunThu")}</span>
                  <span>09:00 - 18:00</span>
                </div>
                <div className="hours-item">
                  <span>{t("contact.fri")}</span>
                  <span>09:00 - 13:00</span>
                </div>
                <div className="hours-item">
                  <span>{t("contact.satHolidays")}</span>
                  <span>{t("contact.closed")}</span>
                </div>
                <div className="hours-notice">
                     {t("contact.hoursNotice")}
                </div>

              </div>
            </div>

            <div className="info-card">
              <h3>{t("contact.officeLocation")}</h3>
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
                {t("contact.addressLine1")}
                <br />
                {t("contact.addressLine2")}
              </p>
            </div>

            <div className="info-card social-card">
              <h3>{t("contact.followUs")}</h3>
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
          <h2 className="section-title">{t("contact.faq")}</h2>
          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-card">
                <div className="faq-question">
                  <span className="faq-icon">❓</span>
                  <h3>{item.q}</h3>
                </div>
                <p className="faq-answer">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
