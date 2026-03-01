// import React, { useState, useEffect } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import "./Header.css";

// const Header = () => {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const handleLogin = () => {
//     navigate("/login");
//     setIsMobileMenuOpen(false);
//   };

//   const handleRegister = () => {
//     navigate("/register");
//     setIsMobileMenuOpen(false);
//   };

//   const closeMobileMenu = () => {
//     setIsMobileMenuOpen(false);
//   };

//   return (
//     <header className={`header ${isScrolled ? "scrolled" : ""}`}>
//       <nav>
//         <div className="logo" onClick={() => navigate("/")}>
//           Smart Vacation ✈️
//         </div>

//         <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
//           ☰
//         </button>

//         <div className={`nav-center ${isMobileMenuOpen ? "active" : ""}`}>
//           <ul className="nav-links">
//             <li>
//               <NavLink
//                 to="/"
//                 className={({ isActive }) => (isActive ? "active" : "")}
//                 onClick={closeMobileMenu}
//               >
//                 עמוד הבית
//               </NavLink>
//             </li>

//             <li>
//               <NavLink
//                 to="/about"
//                 className={({ isActive }) => (isActive ? "active" : "")}
//                 onClick={closeMobileMenu}
//               >
//                 קצת עלינו
//               </NavLink>
//             </li>

//             <li>
//               <NavLink
//                 to="/deals"
//                 className={({ isActive }) => (isActive ? "active" : "")}
//                 onClick={closeMobileMenu}
//               >
//                 חבילות נופש
//               </NavLink>
//             </li>

//             <li>
//               <NavLink
//                 to="/attractions"
//                 className={({ isActive }) => (isActive ? "active" : "")}
//                 onClick={closeMobileMenu}
//               >
//                 אטרקציות
//               </NavLink>
//             </li>

//             <li>
//               <NavLink
//                 to="/contact"
//                 className={({ isActive }) => (isActive ? "active" : "")}
//                 onClick={closeMobileMenu}
//               >
//                 צור קשר
//               </NavLink>
//             </li>
//           </ul>

//           <div className="auth-buttons">
//             <button className="btn btn-login" onClick={handleLogin}>
//               התחברות
//             </button>
//             <button className="btn btn-register" onClick={handleRegister}>
//               הרשמה
//             </button>
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Header;
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Header.css";

// const Header = ({ currentPage = "home" }) => {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 50) {
//         setIsScrolled(true);
//       } else {
//         setIsScrolled(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const handleLogin = () => {
//     navigate("/login");
//   };

//   const handleRegister = () => {
//     navigate("/register");
//   };

//   const scrollToSection = (sectionId) => {
//     if (currentPage === "home") {
//       const element = document.querySelector(sectionId);
//       if (element) {
//         element.scrollIntoView({ behavior: "smooth", block: "start" });
//         setIsMobileMenuOpen(false);
//       }
//     } else {
//       navigate("/");
//       setTimeout(() => {
//         const element = document.querySelector(sectionId);
//         if (element) {
//           element.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//       }, 500);
//     }
//   };

//   return (
//     <header className={`header ${isScrolled ? "scrolled" : ""}`}>
//       <nav>
//         <div className="logo" onClick={() => navigate("/")}>
//           Smart Vacation ✈️
//         </div>
//         <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
//           ☰
//         </button>
//         <div className={`nav-center ${isMobileMenuOpen ? "active" : ""}`}>
//           <ul className="nav-links">
//             <li>
//               <a
//                 onClick={() => {
//                   scrollToSection("#home");
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className={currentPage === "home" ? "active" : ""}
//               >
//                 עמוד הבית
//               </a>
//             </li>
//             <li>
//               <a
//                 onClick={() => {
//                   scrollToSection("#about");
//                   setIsMobileMenuOpen(false);
//                 }}
//               >
//                 קצת עלינו
//               </a>
//             </li>
//             <li>
//               <a
//                 onClick={() => {
//                   scrollToSection("#packages");
//                   setIsMobileMenuOpen(false);
//                 }}
//               >
//                 יעדים מומלצים
//               </a>
//             </li>
//             <li>
//               <a
//                 onClick={() => {
//                   navigate("/attractions");
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className={currentPage === "attractions" ? "active" : ""}
//               >
//                 אטרקציות
//               </a>
//             </li>
//             <li>
//               <a
//                 onClick={() => {
//                   navigate("/contact");
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className={currentPage === "contact" ? "active" : ""}
//               >
//                 צור קשר
//               </a>
//             </li>
//           </ul>
//           <div className="auth-buttons">
//             <button className="btn btn-login" onClick={handleLogin}>
//               התחברות
//             </button>
//             <button className="btn btn-register" onClick={handleRegister}>
//               הרשמה
//             </button>
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Header;

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const refreshCounts = () => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const name = localStorage.getItem('userName');
    setIsLoggedIn(loggedIn);
    setUserName(name || '');

    if (loggedIn && name) {
      const userKey = name.replace(/\s/g, '_');
      const cart = JSON.parse(localStorage.getItem(`cart_${userKey}`) || '[]');
      setCartCount(cart.length);
      const favorites = JSON.parse(localStorage.getItem(`favorites_${userKey}`) || '[]');
      setFavoritesCount(favorites.length);
    } else {
      setCartCount(0);
      setFavoritesCount(0);
    }
  };

  useEffect(() => {
    refreshCounts();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener('storage', refreshCounts);
    // Custom event for same-tab updates
    window.addEventListener('userDataUpdated', refreshCounts);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('storage', refreshCounts);
      window.removeEventListener('userDataUpdated', refreshCounts);
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogin = () => { navigate("/login"); closeMobileMenu(); };
  const handleRegister = () => { navigate("/register"); closeMobileMenu(); };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserName('');
    setCartCount(0);
    setFavoritesCount(0);
    closeMobileMenu();
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <nav>
        <div className="logo" onClick={() => navigate("/")}>
          Smart Vacation ✈️
        </div>

        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>☰</button>

        <div className={`nav-center ${isMobileMenuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>עמוד הבית</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>קצת עלינו</NavLink></li>
            <li><NavLink to="/deals" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>חבילות נופש</NavLink></li>
            <li><NavLink to="/attractions" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>אטרקציות</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>צור קשר</NavLink></li>
          </ul>

          <div className="auth-section">
            {isLoggedIn ? (
              <>
                <div className="user-greeting">
                  <span className="greeting-text">שלום, </span>
                  <span className="user-name">{userName}</span>
                </div>

                <div className="header-icons">
                  {/* Favorites Button */}
                  <button className="icon-btn favorites-btn" onClick={handleFavoritesClick} title="המועדפים שלי">
                    <svg viewBox="0 0 24 24" className="heart-icon-header" aria-hidden="true">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                               2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                               C13.09 3.81 14.76 3 16.5 3
                               19.58 3 22 5.42 22 8.5
                               c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {favoritesCount > 0 && (
                      <span className="icon-badge">{favoritesCount}</span>
                    )}
                  </button>

                  {/* Cart Button */}
                  <button className="icon-btn cart-btn" onClick={handleCartClick} title="עגלת הקניות">
                    <svg viewBox="0 0 24 24" className="cart-icon-svg" aria-hidden="true">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    {cartCount > 0 && (
                      <span className="icon-badge">{cartCount}</span>
                    )}
                  </button>
                </div>

                <button className="btn btn-logout" onClick={handleLogout}>התנתק</button>
              </>
            ) : (
              <div className="auth-buttons">
                <button className="btn btn-login" onClick={handleLogin}>התחברות</button>
                <button className="btn btn-register" onClick={handleRegister}>הרשמה</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;