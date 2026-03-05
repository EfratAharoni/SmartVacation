import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../Header&Footer/Header";
import Footer from "../Header&Footer/Footer";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { BedDouble, CalendarDays, Search, X } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      key: "selection",
    },
  ]);
  const [isDateActive, setIsDateActive] = useState(false);
  const destinationRef = useRef(null);
  const datePickerRef = useRef(null);
  const navigate = useNavigate();

  const availableDestinations = useMemo(
    () => [
      "פריז, צרפת",
      "רומא, איטליה",
      "ברצלונה, ספרד",
      "אמסטרדם, הולנד",
      "לונדון, אנגליה",
      "דובאי, איחוד האמירויות",
      "באלי, אינדונזיה",
      "טוקיו, יפן",
      "ניו יורק, ארה\"ב",
      "מיאמי, ארה\"ב",
      "קנקון, מקסיקו",
      "סנטוריני, יוון",
      "פראג, צ'כיה",
      "בנגקוק, תאילנד",
      "מלדיביים",
      "איסטנבול, טורקיה",
      "ברלין, גרמניה",
      "ליסבון, פורטוגל",
    ],
    []
  );

  const destinationSuggestions = useMemo(() => {
    const query = destinationQuery.trim();
    if (!query) return availableDestinations.slice(0, 8);
    return availableDestinations
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  }, [availableDestinations, destinationQuery]);
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

  const startPlanning = () => {
    const params = new URLSearchParams();
    if (destinationQuery.trim()) {
      params.set("destination", destinationQuery.trim());
    }
    if (isDateActive) {
      const start = dateRange[0].startDate.toISOString().slice(0, 10);
      const end = dateRange[0].endDate.toISOString().slice(0, 10);
      params.set("startDate", start);
      params.set("endDate", end);
    }

    const query = params.toString();
    navigate(query ? `/deals?${query}` : "/deals");
  };

  const explorePlaces = () => {
    document.querySelector("#packages").scrollIntoView({ behavior: "smooth" });
  };

  const formatDateLabel = (date) =>
    new Intl.DateTimeFormat("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

  const dateLabel = isDateActive
    ? `${formatDateLabel(dateRange[0].startDate)} - ${formatDateLabel(
        dateRange[0].endDate
      )}`
    : "תאריך צ'ק-אין - תאריך צ'ק-אאוט";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setIsDestinationsOpen(false);
      }

      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero" id="home">
        <h1 className="floating">החופשה המושלמת שלך מתחילה כאן</h1>
        <div className="hero-slogans">
          <span>תכנון חכם</span>
          <span className="hero-icon"> ✦ </span>
          <span>חופשה בלתי נשכחת</span>
          <span className="hero-icon"> ✦ </span>
          <span>היעדים הכי מדהימים בעולם</span>
        </div>
        <div className="hero-search-bar" role="search" aria-label="חיפוש חופשה">
          <div className="search-cell destination-cell" ref={destinationRef}>
            <BedDouble size={18} className="search-cell-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="לאן נוסעים?"
              value={destinationQuery}
              onChange={(e) => {
                setDestinationQuery(e.target.value);
                setIsDestinationsOpen(true);
              }}
              onFocus={() => setIsDestinationsOpen(true)}
            />

            {isDestinationsOpen && (
              <div className="search-popover">
                {destinationSuggestions.length > 0 ? (
                  destinationSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="search-suggestion-item"
                      onClick={() => {
                        setDestinationQuery(item);
                        setIsDestinationsOpen(false);
                      }}
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <div className="search-suggestion-empty">לא נמצאו יעדים</div>
                )}
              </div>
            )}
          </div>

          <div className="search-cell date-cell" ref={datePickerRef}>
            <CalendarDays size={18} className="search-cell-icon" />
            <button
              type="button"
              className="date-trigger-btn"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
            >
              {dateLabel}
            </button>

            {isDatePickerOpen && (
              <div className="search-popover date-popover">
                <div className="search-popover-header">
                  <span>בחר תאריכים</span>
                  <button
                    type="button"
                    className="popover-close"
                    onClick={() => setIsDatePickerOpen(false)}
                    aria-label="סגירה"
                  >
                    <X size={16} />
                  </button>
                </div>

                <DateRange
                  ranges={dateRange}
                  onChange={(ranges) => {
                    setDateRange([ranges.selection]);
                    setIsDateActive(true);
                  }}
                  minDate={new Date(2026, 0, 1)}
                  maxDate={new Date(2032, 11, 31)}
                  months={1}
                  direction="horizontal"
                  showDateDisplay={false}
                  editableDateInputs={false}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#667eea"]}
                />

                <div className="date-popover-actions">
                  <button
                    type="button"
                    className="popover-action-btn ghost"
                    onClick={() => {
                      setIsDateActive(false);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    נקה
                  </button>
                  <button
                    type="button"
                    className="popover-action-btn"
                    onClick={() => setIsDatePickerOpen(false)}
                  >
                    אישור
                  </button>
                </div>
              </div>
            )}
          </div>

          <button type="button" className="search-submit-btn" onClick={startPlanning}>
            <Search size={18} />
            חיפוש
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

    </div>
  );
};

export default HomePage;
