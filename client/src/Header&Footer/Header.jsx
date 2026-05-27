import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
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
    localStorage.removeItem('authToken');
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

  const handleProfileClick = () => {
    navigate('/profile');
    closeMobileMenu();
  };

  const mobileDrawer = ReactDOM.createPortal(
    <>
      <div className={`mobile-drawer ${isMobileMenuOpen ? "active" : ""}`}>
        {/* Top bar: logo + X */}
        <div className="drawer-top-bar">
          <div className="drawer-brand-mini" onClick={() => { navigate("/"); closeMobileMenu(); }}>
            <span className="drawer-badge">
              <svg className="logo-svg" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" className="logo-svg-bg" />
                <path className="logo-svg-trail" d="M9 30c3.5 0 6-1.5 8.4-4" />
                <path className="logo-svg-trail light" d="M11 34c2.7-.1 4.6-1.1 6.5-2.9" />
                <path className="logo-svg-plane" d="M12 27l11-5.4 11-5.2 2 2.1-9.2 7.3 8.6 2.2-2.3 2.1-10.2-1.1-4.2 7.6-2.2-1.2 2.1-7.2-7.7-3.2z" />
              </svg>
            </span>
            <span className="drawer-brand-name">Smart <span>Vacation</span></span>
          </div>
          <button className="drawer-close-btn" onClick={closeMobileMenu} aria-label="סגור תפריט">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Greeting card */}
        <div className="drawer-greeting">
          <div className="drawer-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/>
            </svg>
          </div>
          <div className="drawer-greeting-text">
            <div className="drawer-hello">שלום{isLoggedIn && userName ? `, ${userName.split(' ')[0]}` : ''}!</div>
            <div className="drawer-tagline">החופשה המושלמת מתחילה כאן</div>
          </div>
        </div>

        {/* Nav links with icons */}
        <ul className="drawer-nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              <span>עמוד הבית</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span>קצת עלינו</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/deals" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </span>
              <span>חבילות נופש</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/attractions" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <span>אטרקציות</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
                  <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
              </span>
              <span>צור קשר</span>
            </NavLink>
          </li>
        </ul>

        {/* Auth section */}
        <div className="drawer-auth-section">
          {isLoggedIn ? (
            <>
              <div className="drawer-icons-row">
                <button className="icon-btn profile-btn" onClick={handleProfileClick} title="הפרופיל שלי">
                  <svg viewBox="0 0 24 24" className="profile-icon-svg" aria-hidden="true">
                    <path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/>
                  </svg>
                </button>
                <button className="icon-btn favorites-btn" onClick={handleFavoritesClick} title="המועדפים שלי">
                  <svg viewBox="0 0 24 24" className="heart-icon-header" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {favoritesCount > 0 && <span className="icon-badge">{favoritesCount}</span>}
                </button>
                <button className="icon-btn cart-btn" onClick={handleCartClick} title="עגלת הקניות">
                  <svg viewBox="0 0 24 24" className="cart-icon-svg" aria-hidden="true">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
                </button>
              </div>
              <button className="btn btn-logout drawer-full-btn" onClick={handleLogout}>התנתק</button>
            </>
          ) : (
            <>
              <button className="drawer-btn-login" onClick={handleLogin}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/>
                </svg>
                התחברות
              </button>
              <button className="drawer-btn-register" onClick={handleRegister}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
                </svg>
                הרשמה
              </button>
            </>
          )}
        </div>

        {/* Globe + flight path illustration */}
        <div className="drawer-travel-art" aria-hidden="true">
          <svg viewBox="0 0 350 138" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="globe-clip">
                <circle cx="54" cy="82" r="34"/>
              </clipPath>
            </defs>

            {/* Globe base */}
            <circle cx="54" cy="82" r="34" fill="#6366f1" fillOpacity="0.08" stroke="#6366f1" strokeWidth="1.8"/>

            {/* Continents clipped to globe */}
            <g clipPath="url(#globe-clip)" fill="#6366f1" fillOpacity="0.3">
              <path d="M34,52 L42,46 L52,48 L50,58 L38,60 L32,56 Z"/>
              <path d="M46,56 L56,50 L66,52 L70,60 L62,64 L50,62 Z"/>
              <path d="M50,62 L62,58 L72,64 L74,78 L70,94 L62,106 L54,104 L46,90 L44,74 Z"/>
              <path d="M72,62 L80,58 L86,64 L86,76 L78,82 L70,80 L70,68 Z"/>
            </g>

            {/* Globe grid */}
            <ellipse cx="54" cy="82" rx="34" ry="10.5" stroke="#6366f1" strokeWidth="1.3"/>
            <ellipse cx="54" cy="82" rx="17"  ry="34"   stroke="#6366f1" strokeWidth="1.1"/>
            <ellipse cx="54" cy="82" rx="30"  ry="34"   stroke="#6366f1" strokeWidth="0.55" strokeDasharray="2 3"/>
            <path d="M24,68 Q54,61 84,68" stroke="#6366f1" strokeWidth="0.8" fill="none"/>
            <path d="M22,96 Q54,103 86,96" stroke="#6366f1" strokeWidth="0.8" fill="none"/>

            {/* Waypoint pins on globe */}
            <circle cx="60" cy="54" r="4"   fill="#6366f1" fillOpacity="0.6" stroke="#6366f1" strokeWidth="1.2"/>
            <circle cx="60" cy="54" r="1.8" fill="white"   fillOpacity="0.95"/>
            <circle cx="74" cy="68" r="3.4" fill="#6366f1" fillOpacity="0.5" stroke="#6366f1" strokeWidth="1"/>
            <circle cx="74" cy="68" r="1.5" fill="white"   fillOpacity="0.95"/>

            {/* Curly / looping dashed flight path */}
            <path
              d="M 88,68 C 130,20 210,5 248,38 C 282,68 272,108 248,100 C 224,92 228,62 252,54 C 268,48 284,52 292,52"
              stroke="#6366f1" strokeWidth="2.1" strokeDasharray="9 6"
              fill="none" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Airplane – detailed commercial silhouette matching reference */}
            <g transform="translate(292,50) rotate(-18)">
              {/* Fuselage */}
              <path d="M 32,0 C 20,-5 6,-6.5 -2,-6.5 L -26,-5 C -32,-3 -32,3 -26,5 L -2,6.5 C 6,6.5 20,5 32,0 Z" fill="#6366f1"/>
              {/* Left wing – rounded swept */}
              <path d="M 6,-6.5 C -1,-7.5 -11,-19 -18,-33 Q -23,-39 -24,-35 C -22,-29 -15,-18 -11,-6.5 Z" fill="#6366f1"/>
              {/* Right wing – rounded swept */}
              <path d="M 6,6.5 C -1,7.5 -11,19 -18,33 Q -23,39 -24,35 C -22,29 -15,18 -11,6.5 Z" fill="#6366f1"/>
              {/* Left engine pod */}
              <ellipse cx="-10" cy="-22" rx="6" ry="2" fill="#6366f1" fillOpacity="0.55"/>
              {/* Right engine pod */}
              <ellipse cx="-10" cy="22"  rx="6" ry="2" fill="#6366f1" fillOpacity="0.55"/>
              {/* Left horizontal stabilizer */}
              <path d="M -24,-5 L -34,-20 L -36,-15 L -28,-5 Z" fill="#6366f1"/>
              {/* Right horizontal stabilizer */}
              <path d="M -24,5 L -34,20 L -36,15 L -28,5 Z" fill="#6366f1"/>
            </g>
          </svg>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}
    </>,
    document.body
  );

  return (
    <>
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <nav>
        <div className="logo" onClick={() => navigate("/")} aria-label="Smart Vacation Home">
          <span className="logo-badge" aria-hidden="true">
            <svg className="logo-svg" viewBox="0 0 48 48" role="img">
              <circle cx="24" cy="24" r="22" className="logo-svg-bg" />
              <path className="logo-svg-trail" d="M9 30c3.5 0 6-1.5 8.4-4" />
              <path className="logo-svg-trail light" d="M11 34c2.7-.1 4.6-1.1 6.5-2.9" />
              <path className="logo-svg-plane" d="M12 27l11-5.4 11-5.2 2 2.1-9.2 7.3 8.6 2.2-2.3 2.1-10.2-1.1-4.2 7.6-2.2-1.2 2.1-7.2-7.7-3.2z" />
            </svg>
          </span>
          <span className="logo-text-group">
            <span className="logo-title">Smart <span>Vacation</span></span>
            <span className="logo-subtitle">Plan Better Travel</span>
          </span>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>☰</button>

        <div className="nav-center">
          <ul className="nav-links">
            <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>עמוד הבית</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>קצת עלינו</NavLink></li>
            <li><NavLink to="/deals" className={({ isActive }) => isActive ? "active" : ""}>חבילות נופש</NavLink></li>
            <li><NavLink to="/attractions" className={({ isActive }) => isActive ? "active" : ""}>אטרקציות</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>צור קשר</NavLink></li>
          </ul>

          <div className="auth-section">
            {isLoggedIn ? (
              <>
                <div className="user-greeting">
                  <span className="greeting-text">שלום, </span>
                  <span className="user-name">{userName}</span>
                </div>
                <div className="header-icons">
                  <button className="icon-btn profile-btn" onClick={handleProfileClick} title="הפרופיל שלי">
                    <svg viewBox="0 0 24 24" className="profile-icon-svg" aria-hidden="true">
                      <path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/>
                    </svg>
                  </button>
                  <button className="icon-btn favorites-btn" onClick={handleFavoritesClick} title="המועדפים שלי">
                    <svg viewBox="0 0 24 24" className="heart-icon-header" aria-hidden="true">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {favoritesCount > 0 && <span className="icon-badge">{favoritesCount}</span>}
                  </button>
                  <button className="icon-btn cart-btn" onClick={handleCartClick} title="עגלת הקניות">
                    <svg viewBox="0 0 24 24" className="cart-icon-svg" aria-hidden="true">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
                  </button>
                </div>
                <button className="btn btn-logout" onClick={handleLogout}>התנתק</button>
              </>
            ) : (
              <div className="auth-buttons">
                <button className="btn btn-login" onClick={handleLogin}>
                  <span className="btn-auth-content">
                    <span className="btn-user-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="btn-user-icon-svg">
                        <path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/>
                      </svg>
                    </span>
                    <span className="btn-auth-text">התחברות</span>
                  </span>
                </button>
                <button className="btn btn-register" onClick={handleRegister}>
                  <span className="btn-auth-content">
                    <span className="btn-user-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="btn-user-icon-svg">
                        <path d="M20 21a8 8 0 00-16 0"/><circle cx="12" cy="8" r="4"/>
                      </svg>
                    </span>
                    <span className="btn-auth-text">הרשמה</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
    {mobileDrawer}
    </>
  );
};

export default Header;