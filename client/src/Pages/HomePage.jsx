import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import Header from "../Header&Footer/Header";
import Footer from "../Header&Footer/Footer";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { BedDouble, CalendarDays, Search, Sparkles, X } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { fuzzySearchDestinations, parseHebrewVacationQuery, VIBE_LABELS } from "./fuzzySearch";

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

  // AI search state
  const [aiMode, setAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [filledByAi, setFilledByAi] = useState(false);

  const destinationRef = useRef(null);
  const datePickerRef = useRef(null);
  const aiInputRef = useRef(null);
  const navigate = useNavigate();

  // Focus AI input when entering AI mode
  useEffect(() => {
    if (aiMode) {
      setTimeout(() => aiInputRef.current?.focus(), 50);
    }
  }, [aiMode]);

  /* ── Destination suggestions via fuzzy search ── */
  const destinationSuggestions = fuzzySearchDestinations(destinationQuery, 8);

  /* ── Scroll + card animation ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

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

  /* ── Outside click ── */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        destinationRef.current &&
        !destinationRef.current.contains(event.target)
      ) {
        setIsDestinationsOpen(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ── Smart search: parse free Hebrew text locally (no API) ── */
  const handleAiSearch = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setFilledByAi(false);

    setTimeout(() => {
      try {
        const data = parseHebrewVacationQuery(aiQuery);
        const hasResult = data.destination || data.startDate || data.budget || data.guests || data.isKosher || data.vibe;

        if (!hasResult) {
          setAiError("לא הצלחתי לזהות פרטים — נסי לכלול יעד, חודש, תקציב או נוסעים.");
          setAiLoading(false);
          return;
        }

        setAiResult(data);
        if (data.destination) setDestinationQuery(data.destination);
        if (data.startDate && data.endDate) {
          setDateRange([{ startDate: new Date(data.startDate), endDate: new Date(data.endDate), key: "selection" }]);
          setIsDateActive(true);
        }

        // Return to regular mode so the user sees the filled bar
        setAiMode(false);
        setFilledByAi(true);
        setTimeout(() => setFilledByAi(false), 3000);
      } catch {
        setAiError("אירעה שגיאה בפענוח, נסי שוב.");
      } finally {
        setAiLoading(false);
      }
    }, 480);
  };

  const exitAiMode = () => {
    setAiMode(false);
    setAiQuery("");
    setAiError(null);
  };

  /* ── Navigate to Deals ── */
  const startPlanning = () => {
    const params = new URLSearchParams();
    if (destinationQuery.trim()) params.set("destination", destinationQuery.trim());
    if (isDateActive) {
      params.set("startDate", dateRange[0].startDate.toISOString().slice(0, 10));
      params.set("endDate", dateRange[0].endDate.toISOString().slice(0, 10));
    }
    if (aiResult?.isKosher) params.set("kosher", "true");
    if (aiResult?.vibe && aiResult.vibe !== "kosher") params.set("vibe", aiResult.vibe);
    if (aiResult?.budget) params.set("budget", aiResult.budget);
    if (aiResult?.guests) params.set("guests", aiResult.guests);
    navigate(params.toString() ? `/deals?${params}` : "/deals");
  };

  /* ── Helpers ── */
  const formatDateLabel = (date) =>
    new Intl.DateTimeFormat("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

  const dateLabel = isDateActive
    ? `${formatDateLabel(dateRange[0].startDate)} - ${formatDateLabel(dateRange[0].endDate)}`
    : "תאריך צ'ק-אין - תאריך צ'ק-אאוט";

  /* ── Summary badge text ── */
  const buildAiSummary = (r) => {
    const parts = [];
    if (r.destination) parts.push(r.destination);
    if (r.startDate && r.endDate) {
      const fmt = (d) =>
        new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit" }).format(
          new Date(d)
        );
      parts.push(`${fmt(r.startDate)} – ${fmt(r.endDate)}`);
    }
    if (r.guests) parts.push(`${r.guests} נוסעים`);
    if (r.budget) parts.push(`עד ₪${r.budget.toLocaleString()}`);
    if (r.vibe && VIBE_LABELS[r.vibe]) parts.push(VIBE_LABELS[r.vibe]);
    return parts.join(" · ");
  };

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

        {/* ── Unified search bar (regular ↔ AI mode) ── */}
        <div
          className={`hero-search-bar${filledByAi ? " search-bar--ai-filled" : ""}${aiMode ? " hero-search-bar--ai-mode" : ""}`}
          role="search"
          aria-label="חיפוש חופשה"
        >
          {aiMode ? (
            /* ── AI mode content ── */
            <>
              <button
                type="button"
                className="ai-back-btn"
                onClick={exitAiMode}
                aria-label="חזרה לחיפוש רגיל"
              >
                <X size={14} />
                <span>חזרה</span>
              </button>

              <Sparkles size={18} className="ai-mode-sparkle" />

              <input
                ref={aiInputRef}
                type="text"
                className="ai-mode-input"
                placeholder='תאר לי את החופשה שלך: "שבוע באיטליה באוגוסט, 5000 ₪ לזוג"'
                value={aiQuery}
                onChange={(e) => { setAiQuery(e.target.value); setAiError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                disabled={aiLoading}
              />

              <button
                type="button"
                className="ai-mode-submit"
                onClick={handleAiSearch}
                disabled={aiLoading || !aiQuery.trim()}
              >
                {aiLoading
                  ? <span className="ai-spinner" aria-hidden="true" />
                  : "נתח"}
              </button>
            </>
          ) : (
            /* ── Regular mode content ── */
            <>
              <div className="search-cell destination-cell" ref={destinationRef}>
                <BedDouble size={18} className="search-cell-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="לאן נוסעים?"
                  value={destinationQuery}
                  onChange={(e) => { setDestinationQuery(e.target.value); setIsDestinationsOpen(true); }}
                  onFocus={() => setIsDestinationsOpen(true)}
                />
                {isDestinationsOpen && (
                  <div className="search-popover">
                    {destinationSuggestions.length > 0 ? (
                      destinationSuggestions.map((item) => (
                        <button key={item} type="button" className="search-suggestion-item"
                          onClick={() => { setDestinationQuery(item); setIsDestinationsOpen(false); }}>
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
                <button type="button" className="date-trigger-btn"
                  onClick={() => setIsDatePickerOpen((prev) => !prev)}>
                  {dateLabel}
                </button>
                {isDatePickerOpen && (
                  <div className="search-popover date-popover">
                    <div className="search-popover-header">
                      <span>בחר תאריכים</span>
                      <button type="button" className="popover-close"
                        onClick={() => setIsDatePickerOpen(false)} aria-label="סגירה">
                        <X size={16} />
                      </button>
                    </div>
                    <DateRange
                      ranges={dateRange}
                      onChange={(ranges) => { setDateRange([ranges.selection]); setIsDateActive(true); }}
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
                      <button type="button" className="popover-action-btn ghost"
                        onClick={() => { setIsDateActive(false); setIsDatePickerOpen(false); }}>
                        נקה
                      </button>
                      <button type="button" className="popover-action-btn"
                        onClick={() => setIsDatePickerOpen(false)}>
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

              {/* AI toggle button — lives inside the pill */}
              <button
                type="button"
                className="ai-pill-btn"
                onClick={() => { setAiMode(true); setAiError(null); }}
                title="חיפוש חכם בשפה חופשית"
              >
                <Sparkles size={15} />
                <span>סוכן AI</span>
              </button>
            </>
          )}
        </div>

        {/* ── Error shown below bar when in AI mode ── */}
        {aiMode && aiError && (
          <p className="ai-inline-error" role="alert">{aiError}</p>
        )}

        {/* ── Result badge after AI fills the bar ── */}
        {aiResult && !aiMode && (
          <div className="ai-result-badge" role="status">
            <Sparkles size={14} className="ai-badge-icon" />
            <span>{buildAiSummary(aiResult)}</span>
            <button
              type="button"
              className="ai-badge-clear"
              onClick={() => {
                setAiResult(null);
                setAiQuery("");
                setDestinationQuery("");
                setIsDateActive(false);
              }}
              aria-label="נקה תוצאת AI"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </section>

      {/* Destinations Preview */}
      <section className="destinations" id="packages">
        <h2 className="section-title">היעדים הפופולריים שלנו</h2>
        <div className="destinations-grid">
          {[
            { img: "/images/paris.jpg",     alt: "פריז, צרפת",        title: "פריז, צרפת",        desc: "עיר האורות - רומנטיקה, תרבות ואמנות",                        keyword: "פריז" },
            { img: "/images/rome.jpg",      alt: "רומא, איטליה",      title: "רומא, איטליה",      desc: "ההיסטוריה העתיקה פוגשת את המודרניות",                        keyword: "רומא" },
            { img: "/images/tokyo.jpg",     alt: "טוקיו, יפן",        title: "טוקיו, יפן",        desc: "מזרח פוגש מערב בעיר המרתקת",                                 keyword: "טוקיו" },
            { img: "/images/bali.jpg",      alt: "באלי, אינדונזיה",   title: "באלי, אינדונזיה",   desc: "גן עדן טרופי עם חופים מדהימים",                              keyword: "באלי" },
            { img: "/images/new-york.jpg",  alt: 'ניו יורק, ארה"ב',  title: 'ניו יורק, ארה"ב',  desc: 'התפוח הגדול - גורדי שחקים, שופינג ואנרגיה ללא הפסקה',       keyword: "ניו יורק" },
            { img: "/images/london.jpg",    alt: "לונדון, אנגליה",    title: "לונדון, אנגליה",    desc: "שילוב מלכותי של מסורת, אופנה ותרבות תוססת",                  keyword: "לונדון" },
            { img: "/images/amsterdam.jpg", alt: "אמסטרדם, הולנד",   title: "אמסטרדם, הולנד",   desc: "תעלות ציוריות, רכיבה על אופניים ואווירה חופשית",             keyword: "אמסטרדם" },
            { img: "/images/barcelona.jpg", alt: "ברצלונה, ספרד",    title: "ברצלונה, ספרד",    desc: "אדריכלות מופלאה, חופים זהובים וחיי לילה סוערים",             keyword: "ברצלונה" },
          ].map(({ img, alt, title, desc, keyword }) => (
            <div
              key={keyword}
              className="destination-card"
              onClick={() => navigate(`/deals?destination=${encodeURIComponent(keyword)}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="destination-image">
                <img src={img} alt={alt} />
              </div>
              <div className="destination-info">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Section */}
      <section className="split-section">
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
