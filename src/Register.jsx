import React, { useState } from "react";
import "./Register.css";

const Register = () => {
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
      newErrors.fullName = "נא להזין שם מלא";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "שם מלא חייב להכיל לפחות 2 תווים";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "נא להזין סיסמה";
    } else if (formData.password.length < 8) {
      newErrors.password = "הסיסמה חייבת להכיל לפחות 8 תווים";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "הסיסמה חייבת להכיל אותיות גדולות, קטנות ומספרים";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "נא לאמת את הסיסמה";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "הסיסמאות אינן תואמות";
    }

    // Terms validation
    if (!agreedToTerms) {
      newErrors.terms = "יש לאשר את תנאי השימוש";
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

    // Simulate API call
    setTimeout(() => {
      console.log("Register data:", formData);
      alert("נרשמת בהצלחה! ברוך הבא ל-Smart Vacation Planner");
      setIsLoading(false);
      // כאן תוסיף את הלוגיקה להרשמה בפועל
    }, 2000);
  };

  const handleGoogleRegister = () => {
    alert("הרשמה עם Google");
    // כאן תוסיף את הלוגיקה להרשמה עם Google
  };

  const handleFacebookRegister = () => {
    alert("הרשמה עם Facebook");
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

    if (strength <= 2) return { strength: 33, text: "חלשה", color: "#ff4444" };
    if (strength <= 3)
      return { strength: 66, text: "בינונית", color: "#ffa500" };
    return { strength: 100, text: "חזקה", color: "#44ff44" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Visual */}
        <div className="register-visual-section">
          <div className="visual-content">
            {/* <div className="logo">Smart Vacation ✈️</div> */}
            <h2>הצטרף אלינו היום</h2>
            <p>צור חשבון חינם והתחל לתכנן את החופשה הבאה שלך בקלות ובמהירות</p>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-number">1</div>
                <div className="benefit-content">
                  <h4>צור חשבון</h4>
                  <p>הרשמה פשוטה ומהירה</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-number">2</div>
                <div className="benefit-content">
                  <h4>בחר יעד</h4>
                  <p>מאות יעדים ברחבי העולם</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-number">3</div>
                <div className="benefit-content">
                  <h4>תכנן חופשה</h4>
                  <p>תכנון אוטומטי ומותאם אישית</p>
                </div>
              </div>
            </div>

            <div className="stats">
              <div className="stat-item">
                <h3>10,000+</h3>
                <p>משתמשים פעילים</p>
              </div>
              <div className="stat-item">
                <h3>150+</h3>
                <p>יעדים ברחבי העולם</p>
              </div>
              <div className="stat-item">
                <h3>4.9⭐</h3>
                <p>דירוג ממוצע</p>
              </div>
            </div>
          </div>
          <div className="decorative-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="register-form-section">
          <div className="register-header">
            <h1>הרשמה</h1>
            <p>מלא את הפרטים ליצירת חשבון חדש</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className={`progress-step ${currentStep >= 1 ? "active" : ""}`}
            >
              <div className="step-circle">1</div>
              <span>פרטים אישיים</span>
            </div>
            <div className="progress-line"></div>
            <div
              className={`progress-step ${currentStep >= 2 ? "active" : ""}`}
            >
              <div className="step-circle">2</div>
              <span>אבטחה</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Step 1 - Personal Details */}
            {currentStep === 1 && (
              <div className="form-step" key="step1">
                {/* Full Name Field */}
                <div className="form-group">
                  <label htmlFor="fullName">שם מלא</label>
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
                      placeholder="     הכנס את שמך המלא"
                      className={errors.fullName ? "error" : ""}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">אימייל</label>
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
                      placeholder="     הכנס את כתובת האימייל שלך"
                      className={errors.email ? "error" : ""}
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Phone Field */}
                <div className="form-group">
                  <label htmlFor="phone">טלפון</label>
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
                      placeholder="     הכנס את מספר הטלפון שלך"
                      className={errors.phone ? "error" : ""}
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
                  המשך לשלב הבא
                </button>

                {/* Divider */}
                <div className="divider">
                  <span>או הירשם עם</span>
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
                  <label htmlFor="password">סיסמה</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="הזן סיסמה חזקה"
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
                  <label htmlFor="confirmPassword">אימות סיסמה</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="הזן סיסמה שנית"
                      className={errors.confirmPassword ? "error" : ""}
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
                      אני מסכים ל<a href="#">תנאי השימוש</a> ול
                      <a href="#">מדיניות הפרטיות</a>
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
                    חזור
                  </button>
                  <button
                    type="submit"
                    className={`submit-btn ${isLoading ? "loading" : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        נרשם...
                      </>
                    ) : (
                      "הירשם"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Login Link */}
            <div className="login-link">
              <p>
                כבר יש לך חשבון? <a href="/login">התחבר עכשיו</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
