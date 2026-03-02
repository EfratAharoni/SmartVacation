// import React, { useState } from "react";
// import "./Login.css";

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Email validation
//     if (!formData.email) {
//       newErrors.email = "נא להזין כתובת אימייל";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "כתובת אימייל לא תקינה";
//     }

//     // Password validation
//     if (!formData.password) {
//       newErrors.password = "נא להזין סיסמה";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "הסיסמה חייבת להכיל לפחות 6 תווים";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setIsLoading(true);

//     // Simulate API call
//     setTimeout(() => {
//       console.log("Login data:", formData);
//       alert("התחברת בהצלחה!");
//       setIsLoading(false);
//       // כאן תוסיף את הלוגיקה להתחברות בפועל
//     }, 1500);
//   };

//   const handleGoogleLogin = () => {
//     alert("התחברות עם Google");
//     // כאן תוסיף את הלוגיקה להתחברות עם Google
//   };

//   const handleFacebookLogin = () => {
//     alert("התחברות עם Facebook");
//     // כאן תוסיף את הלוגיקה להתחברות עם Facebook
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">
//         {/* Left Side - Form */}
//         <div className="login-form-section">
//           <div className="login-header">
//             <h1>ברוכים הבאים</h1>
//             <p>התחבר לחשבון שלך והמשך לתכנן את החופשה המושלמת</p>
//           </div>

//           <form onSubmit={handleSubmit} className="login-form">
//             {/* Email Field */}
//             <div className="form-group">
//               <label htmlFor="email">אימייל</label>
//               <div className="input-wrapper">
//                 {formData.email === "" && (
//                   <span className="input-icon">📧</span>
//                 )}
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="     הכנס את כתובת האימייל שלך"
//                   className={errors.email ? "error" : ""}
//                 />
//               </div>
//               {errors.email && (
//                 <span className="error-message">{errors.email}</span>
//               )}
//             </div>

//             {/* Password Field */}
//             <div className="form-group">
//               <label htmlFor="password">סיסמה</label>
//               <div className="input-wrapper">
//                 {formData.password === "" && (
//                   <span className="input-icon">🔒</span>
//                 )}
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="     הכנס את הסיסמה שלך"
//                   className={errors.password ? "error" : ""}
//                 />
//                 <button
//                   type="button"
//                   className="toggle-password"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? "👁️" : "👁️‍🗨️"}
//                 </button>
//               </div>
//               {errors.password && (
//                 <span className="error-message">{errors.password}</span>
//               )}
//             </div>

//             {/* Remember Me & Forgot Password */}
//             <div className="form-options">
//               <label className="checkbox-label">
//                 <input type="checkbox" />
//                 <span>זכור אותי</span>
//               </label>
//               <a href="#" className="forgot-password">
//                 שכחת סיסמה?{" "}
//               </a>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className={`submit-btn ${isLoading ? "loading" : ""}`}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <span className="spinner"></span>
//                   מתחבר...
//                 </>
//               ) : (
//                 "התחבר"
//               )}
//             </button>

//             {/* Divider */}
//             <div className="divider">
//               <span>או המשך עם</span>
//             </div>

//             {/* Social Login */}
//             <div className="social-login">
//               <button
//                 type="button"
//                 className="social-btn google-btn"
//                 onClick={handleGoogleLogin}
//               >
//                 <img src="https://www.google.com/favicon.ico" alt="Google" />
//                 Google
//               </button>
//               <button
//                 type="button"
//                 className="social-btn facebook-btn"
//                 onClick={handleFacebookLogin}
//               >
//                 <span className="fb-icon">f</span>
//                 Facebook
//               </button>
//             </div>

//             {/* Register Link */}
//             <div className="register-link">
//               <p>
//                 אין לך חשבון? <a href="/register">הירשם עכשיו</a>
//               </p>
//             </div>
//           </form>
//         </div>

//         {/* Right Side - Visual */}
//         <div className="login-visual-section">
//           <div className="visual-content">
//             {/* <div className="logo">Smart Vacation ✈️</div> */}
//             <h2>התחל את המסע שלך</h2>
//             <p>
//               גלה יעדים מדהימים, תכנן את החופשה המושלמת ושמור את כל הטיולים שלך
//               במקום אחד
//             </p>
//             <div className="features-list">
//               <div className="feature-item">
//                 <span className="feature-icon">✓</span>
//                 <span>תכנון חכם ואוטומטי</span>
//               </div>
//               <div className="feature-item">
//                 <span className="feature-icon">✓</span>
//                 <span>מאות יעדים ברחבי העולם</span>
//               </div>
//               <div className="feature-item">
//                 <span className="feature-icon">✓</span>
//                 <span>התאמה אישית מלאה</span>
//               </div>
//             </div>
//           </div>
//           <div className="decorative-circles">
//             <div className="circle circle-1"></div>
//             <div className="circle circle-2"></div>
//             <div className="circle circle-3"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
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
      newErrors.email = "נא להזין כתובת אימייל";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "כתובת אימייל לא תקינה";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "נא להזין סיסמה";
    } else if (formData.password.length < 6) {
      newErrors.password = "הסיסמה חייבת להכיל לפחות 6 תווים";
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

    // Simulate API call
    setTimeout(() => {
      console.log("Login data:", formData);
      
      // Save user data to localStorage
      const userName = formData.email.split('@')[0]; // Extract name from email
      localStorage.setItem('userName', userName);
      localStorage.setItem('isLoggedIn', 'true');
      
      setIsLoading(false);
      
      // Navigate to home page
      navigate('/');
    }, 1500);
  };

  const handleGuestMode = () => {
    navigate('/');
  };

  const handleGoogleLogin = () => {
    alert("התחברות עם Google");
    // כאן תוסיף את הלוגיקה להתחברות עם Google
  };

  const handleFacebookLogin = () => {
    alert("התחברות עם Facebook");
    // כאן תוסיף את הלוגיקה להתחברות עם Facebook
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Form */}
        <div className="login-form-section">

          <div className="login-header">
            <h1>ברוכים הבאים</h1>
            <p>התחבר לחשבון שלך והמשך לתכנן את החופשה המושלמת</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">סיסמה</label>
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
                  placeholder="     הכנס את הסיסמה שלך"
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
                <span>זכור אותי</span>
              </label>
              <a href="#" className="forgot-password">
                שכחת סיסמה?{" "}
              </a>
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
                  מתחבר...
                </>
              ) : (
                "התחבר"
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>או המשך עם</span>
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
                אין לך חשבון? <a href="/register">הירשם עכשיו</a>
              </p>
            </div>

            {/* Guest Mode Button */}
            <button 
              className="guest-mode-btn bottom" 
              onClick={handleGuestMode}
              type="button"
            >
              <span className="guest-icon">👤</span>
              לא רוצה להתחבר? המשך כאורח
            </button>
          </form>
        </div>

        {/* Right Side - Visual */}
        <div className="login-visual-section">
          <div className="visual-content">
            {/* <div className="logo">Smart Vacation ✈️</div> */}
            <h2>התחל את המסע שלך</h2>
            <p>
              גלה יעדים מדהימים, תכנן את החופשה המושלמת ושמור את כל הטיולים שלך
              במקום אחד
            </p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>תכנון חכם ואוטומטי</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>מאות יעדים ברחבי העולם</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>התאמה אישית מלאה</span>
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