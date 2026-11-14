import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { apiFetch } from "../utils/api";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { onLoggedIn } from "../utils/userSync";
import { toast } from "../components/Toast";
import useServerFeatures from "../utils/useServerFeatures";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { emailEnabled } = useServerFeatures(); // "forgot password" needs an email server
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    // Email validation
    if (!formData.email) {
      newErrors.email = t("login.err.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("login.err.emailInvalid");
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t("login.err.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("login.err.passwordShort");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch("/users/login", {
        method: "POST",
        body: {
          email: formData.email.trim(),
          password: formData.password,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.user) {
        setErrors({
          password: data.message || t("login.err.wrong"),
        });
        return;
      }

      localStorage.setItem("userName", data.user.fullName);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("authToken", data.token || "");
      window.dispatchEvent(new Event("userDataUpdated"));
      await onLoggedIn(data.user);

      navigate("/");
    } catch {
      setErrors({
        password: t("common.networkError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    navigate('/');
  };

  const handleGoogleLogin = () => {
    toast.info(t("login.socialSoon", { provider: "Google" }));
    // כאן תוסיף את הלוגיקה להתחברות עם Google
  };

  const handleFacebookLogin = () => {
    toast.info(t("login.socialSoon", { provider: "Facebook" }));
    // כאן תוסיף את הלוגיקה להתחברות עם Facebook
  };

  return (
    <div className="login-page">
      <LanguageSwitcher className="floating" />
      <div className="login-container">
        {/* Left Side - Form */}
        <div className="login-form-section">

          <div className="login-header">
            <h1>{t("login.welcome")}</h1>
            <p>{t("login.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                  placeholder={`     ${t("login.emailPlaceholder")}`}
                  className={errors.email ? "error" : ""}
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

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
                  placeholder={`     ${t("login.passwordPlaceholder")}`}
                  className={errors.password ? "error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>{t("login.rememberMe")}</span>
              </label>
              {emailEnabled && (
                <Link to="/forgot-password" className="forgot-password">
                  {t("login.forgot")}
                </Link>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {t("login.loggingIn")}
                </>
              ) : (
                t("login.login")
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>{t("common.orContinueWith")}</span>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <button
                type="button"
                className="social-btn google-btn"
                onClick={handleGoogleLogin}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" />
                Google
              </button>
              <button
                type="button"
                className="social-btn facebook-btn"
                onClick={handleFacebookLogin}
              >
                <span className="fb-icon">f</span>
                Facebook
              </button>
            </div>

            {/* Register Link */}
            <div className="register-link">
              <p>
                {t("login.noAccount")} <Link to="/register">{t("login.registerNow")}</Link>
              </p>
            </div>

            {/* Guest Mode Button */}
            <button 
              className="guest-mode-btn bottom" 
              onClick={handleGuestMode}
              type="button"
            >
              <span className="guest-icon">👤</span>
              {t("login.guest")}
            </button>
          </form>
        </div>

        {/* Right Side - Visual */}
        <div className="login-visual-section">
          <div className="visual-content">
            {/* <div className="logo">Smart Vacation ✈️</div> */}
            <h2>{t("login.visualTitle")}</h2>
            <p>{t("login.visualText")}</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>{t("login.feature1")}</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>{t("login.feature2")}</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>{t("login.feature3")}</span>
              </div>
            </div>
          </div>
          <div className="decorative-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;