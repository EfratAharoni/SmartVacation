import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Animation on scroll observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    document
      .querySelectorAll(".feature-card, .destination-card")
      .forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        card.style.transition = "all 0.6s ease";
        observer.observe(card);
      });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    navigate("/login"); // נווט לדף התחברות
    // כאן תוסיף ניווט לדף התחברות
  };

  const handleRegister = () => {
    navigate("/register"); // נווט לדף הרשמה
    // כאן תוסיף ניווט לדף הרשמה
  };

  const startPlanning = () => {
    alert("מתחיל תכנון חופשה...");
    // כאן תוסיף ניווט לדף תכנון החופשה
  };

  const explorePlaces = () => {
    document.querySelector("#packages").scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className={`header ${isScrolled ? "scrolled" : ""}`} id="header">
        <nav>
          <div className="logo">Smart Vacation ✈️</div>
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            ☰
          </button>
          <div className={`nav-center ${isMobileMenuOpen ? "active" : ""}`}>
            <ul className="nav-links">
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#home");
                  }}
                >
                  עמוד הבית
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#about");
                  }}
                >
                  קצת עלינו
                </a>
              </li>
              <li>
                <a
                  href="#packages"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#packages");
                  }}
                >
                  חבילות נופש
                </a>
              </li>
              <li>
                <a
                  href="#attractions"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#attractions");
                  }}
                >
                  אטרקציות
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#contact");
                  }}
                >
                  צור קשר
                </a>
              </li>
            </ul>
            <div className="auth-buttons">
              <button className="btn btn-login" onClick={handleLogin}>
                התחברות
              </button>
              <button className="btn btn-register" onClick={handleRegister}>
                הרשמה
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <h1 className="floating">החופשה המושלמת שלך מתחילה כאן</h1>
        <p>
          תכנון חכם, חופשה כלתי נשכחת. גלה את היעדים המדהימים בעולם עם Smart
          Vacation Planner
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={startPlanning}>
            התחל לתכנן עכשיו
          </button>
          <button className="btn btn-secondary" onClick={explorePlaces}>
            גלה יעדים
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="about">
        <h2 className="section-title">?למה לבחור בנו</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>יעדים מגוונים</h3>
            <p>מגוון רחב של יעדים ברחבי העולם, מאירופה ועד אסיא ואמריקה</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>מחירים משתלמים</h3>
            <p>חבילות נופש במחירים תחרותיים עם אפשרות לסינון לפי תקציב</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>תכנון אוטומטי</h3>
            <p>מערכת חכמה ליצירת לוח זמנים יומי מותאם אישית</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>אטרקציות מובחרות</h3>
            <p>מגוון אטרקציות ופעילויות בכל יעד, מותאמות להעדפות שלך</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>חוויה אישית</h3>
            <p>התאמה אישית מלאה לפי תקציב, תאריכים והעדפות אישיות</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>בטוח ואמין</h3>
            <p>מערכת מאובטחת לשמירת הטיולים והפרטים האישיים שלך</p>
          </div>
        </div>
      </section>

      {/* Destinations Preview */}
      <section className="destinations" id="packages">
        <h2 className="section-title">היעדים הפופולריים שלנו</h2>
        <div className="destinations-grid">
          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/paris.jpg" alt="פריז, צרפת" />
            </div>
            <div className="destination-info">
              <h3>פריז, צרפת</h3>
              <p>עיר האורות - רומנטיקה, תרבות ואמנות</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/rome.jpg" alt="רומא, איטליה" />
            </div>
            <div className="destination-info">
              <h3>רומא, איטליה</h3>
              <p>ההיסטוריה העתיקה פוגשת את המודרניות</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/tokyo.jpg" alt="טוקיו, יפן" />
            </div>
            <div className="destination-info">
              <h3>טוקיו, יפן</h3>
              <p>מזרח פוגש מערב בעיר המרתקת</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/bali.jpg" alt="באלי, אינדונזיה" />
            </div>
            <div className="destination-info">
              <h3>באלי, אינדונזיה</h3>
              <p>גן עדן טרופי עם חופים מדהימים</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact">
        <div className="footer-content">
          <div className="footer-links">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#home");
              }}
            >
              עמוד הבית
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#about");
              }}
            >
              אודות
            </a>
            <a
              href="#packages"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#packages");
              }}
            >
              חבילות
            </a>
            <a
              href="#attractions"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#attractions");
              }}
            >
              אטרקציות
            </a>
            <a href="#">תנאי שימוש</a>
            <a href="#">פרטיות</a>
          </div>
          <p>&copy; 2026 Smart Vacation Planner. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
