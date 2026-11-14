import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { apiFetch } from "../utils/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { onLoggedIn } from "../utils/userSync";
import { toast } from "../components/Toast";

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const validateStep1 = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = t("register.err.nameRequired");
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t("register.err.nameShort");
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = t("register.err.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("register.err.emailInvalid");
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = t("register.err.phoneRequired");
    } else if (!/^(0\d{1,2}-?\d{7}|\+?[\d\-()]{7,20})$/.test(formData.phone.replace(/\s/g, ""))) {
      // Israeli format, or an international number
      newErrors.phone = t("register.err.phoneInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = t("register.err.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("register.err.passwordShort");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t("register.err.passwordComplexity");
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("register.err.confirmRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("register.err.mismatch");
    }

    // Terms validation
    if (!agreedToTerms) {
      newErrors.terms = t("register.err.terms");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch("/users/add", {
        method: "POST",
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          email: data.message || t("register.failed"),
        }));
        return;
      }

      localStorage.setItem("userName", data.user?.fullName || formData.fullName);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", data.user?.email || formData.email);
      localStorage.setItem("authToken", data.token || "");
      window.dispatchEvent(new Event("userDataUpdated"));
      await onLoggedIn(data.user);

      navigate("/");
    } catch {
      setErrors((prev) => ({
        ...prev,
        email: t("common.networkError"),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    navigate("/");
  };

  const handleGoogleRegister = () => {
    toast.info(t("login.socialSoon", { provider: "Google" }));
    // כאן תוסיף את הלוגיקה להרשמה עם Google
  };

  const handleFacebookRegister = () => {
    toast.info(t("login.socialSoon", { provider: "Facebook" }));
    // כאן תוסיף את הלוגיקה להרשמה עם Facebook
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, text: t("register.weak"), color: "#ff4444" };
    if (strength <= 3)
      return { strength: 66, text: t("register.medium"), color: "#ffa500" };
    return { strength: 100, text: t("register.strong"), color: "#44ff44" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="register-page">
      <LanguageSwitcher className="floating" />
      <div className="register-container">
        {/* Right Side - Form */}
        <div className="register-form-section">
          <div className="register-header">
            <h1>{t("register.title")}</h1>
            <p>{t("register.subtitle")}</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className={`progress-step ${currentStep >= 1 ? "active" : ""}`}
            >
              <div className="step-circle">1</div>
              <span>{t("register.personal")}</span>
            </div>
            <div className="progress-line"></div>
            <div
              className={`progress-step ${currentStep >= 2 ? "active" : ""}`}
            >
              <div className="step-circle">2</div>
              <span>{t("register.security")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Step 1 - Personal Details */}
            {currentStep === 1 && (
              <div className="form-step" key="step1">
                {/* Full Name Field */}
                <div className="form-group">
                  <label htmlFor="fullName">{t("common.fullName")}</label>
                  <div className="input-wrapper">
                    {formData.fullName === "" && (
                      <span className="input-icon">👤</span>
                    )}
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder={t("register.fullNamePlaceholder")}
                      className={`${errors.fullName ? "error" : ""} ${
                        formData.fullName === "" ? "has-icon" : ""
                      }`.trim()}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">{t("common.email")}</label>
                  <div className="input-wrapper">
                    {formData.email === "" && (
                      <span className="input-icon">📧</span>
                    )}
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("register.emailPlaceholder")}
                      className={`${errors.email ? "error" : ""} ${
                        formData.email === "" ? "has-icon" : ""
                      }`.trim()}
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Phone Field */}
                <div className="form-group">
                  <label htmlFor="phone">{t("common.phone")}</label>
                  <div className="input-wrapper">
                    {formData.phone === "" && (
                      <span className="input-icon">📱</span>
                    )}
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("register.phonePlaceholder")}
                      className={`${errors.phone ? "error" : ""} ${
                        formData.phone === "" ? "has-icon" : ""
                      }`.trim()}
                    />
                  </div>
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                <button
                  type="button"
                  className="next-btn"
                  onClick={handleNextStep}
                >
                  {t("register.next")}
                </button>

                {/* Divider */}
                <div className="divider">
                  <span>{t("register.orRegisterWith")}</span>
                </div>

                {/* Social Register */}
                <div className="social-login">
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={handleGoogleRegister}
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                    />
                    Google
                  </button>
                  <button
                    type="button"
                    className="social-btn facebook-btn"
                    onClick={handleFacebookRegister}
                  >
                    <span className="fb-icon">f</span>
                    Facebook
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 - Security */}
            {currentStep === 2 && (
              <div className="form-step" key="step2">
                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password">{t("common.password")}</label>
                  <div className="input-wrapper">
                    {formData.password === "" && (
                      <span className="input-icon">🔒</span>
                    )}
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t("register.passwordPlaceholder")}
                      className={`${errors.password ? "error" : ""} ${
                        formData.password === "" ? "has-icon" : ""
                      }`.trim()}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${passwordStrength.strength}%`,
                            background: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                      <span style={{ color: passwordStrength.color }}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="form-group">
                  <label htmlFor="confirmPassword">{t("register.confirmPassword")}</label>
                  <div className="input-wrapper">
                    {formData.confirmPassword === "" && (
                      <span className="input-icon">🔒</span>
                    )}
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t("register.confirmPlaceholder")}
                      className={`${errors.confirmPassword ? "error" : ""} ${
                        formData.confirmPassword === "" ? "has-icon" : ""
                      }`.trim()}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="terms-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <span>
                      {t("register.agreePrefix")}<a href="#">{t("register.terms")}</a>{t("register.and")}
                      <a href="#">{t("register.privacy")}</a>
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="error-message">{errors.terms}</span>
                  )}
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    className="back-btn"
                    onClick={handlePrevStep}
                  >
                    {t("register.back")}
                  </button>
                  <button
                    type="submit"
                    className={`submit-btn ${isLoading ? "loading" : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        {t("register.registering")}
                      </>
                    ) : (
                      t("register.register")
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Login Link */}
            <div className="login-link">
              <p>
                {t("register.haveAccount")} <Link to="/login">{t("register.loginNow")}</Link>
              </p>
            </div>

            {/* Guest Mode Button */}
            <button 
              className="guest-mode-btn bottom" 
              onClick={handleGuestMode} 
              type="button"
            >
              <span className="guest-icon">👤</span>
              {t("register.guest")}
            </button>
          </form>
          {/* <div className="guest-link">
            <span className="guest-icon">👤</span>
            לא רוצה להירשם?{" "}
            <button
              type="button"
              className="guest-link-btn"
              onClick={handleGuestMode}
            >
              המשך כאורח
            </button>
          </div> */}
        </div>

        {/* Left Side - Visual */}
        <div className="register-visual-section">
          <div className="visual-content">
            {/* <div className="logo">Smart Vacation ✈️</div> */}
            <h2>{t("register.visualTitle")}</h2>
            <p>{t("register.visualText")}</p>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-number">1</div>
                <div className="benefit-content">
                  <h4>{t("register.b1Title")}</h4>
                  <p>{t("register.b1Text")}</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-number">2</div>
                <div className="benefit-content">
                  <h4>{t("register.b2Title")}</h4>
                  <p>{t("register.b2Text")}</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-number">3</div>
                <div className="benefit-content">
                  <h4>{t("register.b3Title")}</h4>
                  <p>{t("register.b3Text")}</p>
                </div>
              </div>
            </div>

            <div className="stats">
              <div className="stat-item">
                <h3>10,000+</h3>
                <p>{t("register.activeUsers")}</p>
              </div>
              <div className="stat-item">
                <h3>150+</h3>
                <p>{t("register.destinations")}</p>
              </div>
              <div className="stat-item">
                <h3>4.9⭐</h3>
                <p>{t("register.avgRating")}</p>
              </div>
            </div>
          </div>
          <div className="decorative-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
