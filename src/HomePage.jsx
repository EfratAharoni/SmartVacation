import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const handleDeals = () => {
    navigate("/deals");
    setIsMobileMenuOpen(false);
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
      <header className={`header ${isScrolled ? "scrolled" : ""}`}>
        <nav>
          <div className="logo" onClick={() => scrollToSection("#home")}>
            Smart Vacation ✈️
          </div>
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            ☰
          </button>
          <div className={`nav-center ${isMobileMenuOpen ? "active" : ""}`}>
            <ul className="nav-links">
              <li>
                <a onClick={() => scrollToSection("#home")}>עמוד הבית</a>
              </li>
              <li>
                <a onClick={() => scrollToSection("#about")}>קצת עלינו</a>
              </li>
              <li>
                <a onClick={handleDeals}>חבילות נופש</a>
              </li>
              <li>
                <a onClick={() => navigate("/attractions")}>אטרקציות</a>
              </li>
              <li>
                <a onClick={() => scrollToSection("#contact")}>צור קשר</a>
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
        <div class="hero-slogans">
          <span>תכנון חכם</span>
          <span class="hero-icon"> ✦ </span>
          <span>חופשה בלתי נשכחת</span>
          <span class="hero-icon"> ✦ </span>
          <span>היעדים הכי מדהימים בעולם</span>
        </div>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={startPlanning}>
            התחל לתכנן עכשיו
          </button>
          <button className="btn btn-secondary" onClick={explorePlaces}>
            גלה יעדים
          </button>
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

          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/new-york.jpg" />
            </div>
            <div className="destination-info">
              <h3>ניו יורק, ארה"ב</h3>
              <p>התפוח הגדול - גורדי שחקים, שופינג ואנרגיה ללא הפסקה</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/london.jpg" alt="לונדון, אנגליה" />
            </div>
            <div className="destination-info">
              <h3>לונדון, אנגליה</h3>
              <p>שילוב מלכותי של מסורת, אופנה ותרבות תוססת</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/amsterdam.jpg" alt="אמסטרדם, הולנד" />
            </div>
            <div className="destination-info">
              <h3>אמסטרדם, הולנד</h3>
              <p>תעלות ציוריות, רכיבה על אופניים ואווירה חופשית</p>
            </div>
          </div>

          <div className="destination-card">
            <div className="destination-image">
              <img src="/images/barcelona.jpg" alt="ברצלונה, ספרד" />
            </div>
            <div className="destination-info">
              <h3>ברצלונה, ספרד</h3>
              <p>אדריכלות מופלאה, חופים זהובים וחיי לילה סוערים</p>
            </div>
          </div>
        </div>
        {/* <div className="more-destinations-container">
          <a href="#" className="discover-more-link">
          <span className="arrow-icon">←</span>
            גלה עוד יעדים לחופשה
          </a>
        </div> */}
      </section>
      {/* Features Section */}
      <section className="split-section">
        {/* חצי כהה - אודות */}
        <div className="side about-side">
          <div className="side-content">
            <h2 className="title-light">הסיפור שלנו</h2>
            <p className="text-light">
              אנחנו ב-SmartVacation מאמינים שתכנון טיול לא צריך להיות עבודה קשה.
              יצרנו מערכת חכמה שחוסכת לכם זמן, כסף וכאבי ראש, כדי שתוכלו להתמקד
              במה שחשוב באמת – החופשה שלכם.
            </p>
            <div className="mini-bullets">
              <div className="bullet">✦ תכנון אוטומטי</div>
              <div className="bullet">✦ מחירים ללא תיווך</div>
              <div className="bullet">✦ ביטחון מלא</div>
            </div>
          </div>
        </div>

        {/* חצי בהיר - צור קשר */}
        <div className="side contact-side">
          <div className="side-content">
            <h2 className="title-dark">דברו איתנו</h2>
            <form className="split-form">
              <input type="text" placeholder="שם מלא" required />
              <input type="tel" placeholder="טלפון" required />
              <button type="submit">שלחו הודעה</button>
            </form>

            <div className="social-links-minimal">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>

              <a href="#" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
                <span>Instagram</span>
              </a>

              <a href="#" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <a onClick={() => scrollToSection("#home")}>עמוד הבית</a>
            <a onClick={() => scrollToSection("#about")}>אודות</a>
            <a onClick={() => scrollToSection("#packages")}>חבילות</a>
            <a
              onClick={() => navigate("/attractions")}
              style={{ cursor: "pointer" }}
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
