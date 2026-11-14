import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { BedDouble, CalendarDays, Search, Sparkles, X } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { he as heLocale, enUS } from "date-fns/locale";
import { fuzzySearchDestinations, parseHebrewVacationQuery } from "./fuzzySearch";
import { apiFetch } from "../utils/api";
import useLocalize from "../utils/useLocalize";
import { usePreferences } from "../context/PreferencesContext";
import { toast } from "../components/Toast";

const HomePage = () => {
  const [, setIsScrolled] = useState(false);
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
  const { t, isEn, tDest, formatDate } = useLocalize();
  const { price } = usePreferences();
  const [splitForm, setSplitForm] = useState({ name: "", phone: "" });
  const [splitSent, setSplitSent] = useState(false);

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

  /* ── Smart search: call Groq via server, fallback to local parser ── */
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setFilledByAi(false);

    let data = null;
    let rankedDeals = null;

    try {
      const resp = await apiFetch("/ai/search", {
        method: "POST",
        body: { query: aiQuery },
      });

      if (resp.ok) {
        const json = await resp.json();
        data = json.filters;
        rankedDeals = json.rankedDeals;
      } else {
        throw new Error("server error");
      }
    } catch {
      // Fallback: local regex parser
      data = parseHebrewVacationQuery(aiQuery);
    }

    const hasResult = data && (data.destination || data.startDate || data.budget || data.guests || data.isKosher || data.vibe);

    if (!hasResult) {
      setAiError(t("home.aiNoMatch"));
      setAiLoading(false);
      return;
    }

    setAiResult(data);
    if (data.destination) setDestinationQuery(tDest(data.destination));
    if (data.startDate && data.endDate) {
      setDateRange([{ startDate: new Date(data.startDate), endDate: new Date(data.endDate), key: "selection" }]);
      setIsDateActive(true);
    }

    setAiMode(false);
    setFilledByAi(true);
    setTimeout(() => setFilledByAi(false), 3000);
    setAiLoading(false);

    // Navigate to deals — pass only destination/kosher/vibe as URL params so the
    // regular grid stays meaningful. Dates & budget were already used server-side;
    // passing them as URL params would over-filter the regular grid to 0 results.
    const params = new URLSearchParams();
    if (data.destination) params.set("destination", data.destination);
    if (data.isKosher)    params.set("kosher", "true");
    if (data.vibe && data.vibe !== "kosher") params.set("vibe", data.vibe);

    navigate(
      params.toString() ? `/deals?${params}` : "/deals",
      { state: { aiRankedDeals: rankedDeals, aiQuery } }
    );
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
  const formatDateLabel = (date) => formatDate(date);

  const dateLabel = isDateActive
    ? `${formatDateLabel(dateRange[0].startDate)} - ${formatDateLabel(dateRange[0].endDate)}`
    : t("home.datesPlaceholder");

  /* ── Summary badge text ── */
  const buildAiSummary = (r) => {
    const parts = [];
    if (r.destination) parts.push(tDest(r.destination));
    if (r.startDate && r.endDate) {
      const fmt = (d) => formatDate(d, { day: "2-digit", month: "2-digit" });
      parts.push(`${fmt(r.startDate)} – ${fmt(r.endDate)}`);
    }
    if (r.guests) parts.push(t("home.travelers", { count: r.guests }));
    if (r.budget) parts.push(t("home.upTo", { amount: price(r.budget) }));
    if (r.vibe) parts.push(t(`vibes.${r.vibe}`, { defaultValue: "" }));
    return parts.filter(Boolean).join(" · ");
  };

  /* ── Quick "call me back" form ── */
  const submitSplitForm = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: { name: splitForm.name, phone: splitForm.phone, subject: "callback", message: "Callback request / בקשה לחזרה טלפונית" },
      });
      if (!res.ok) throw new Error();
      setSplitSent(true);
      setSplitForm({ name: "", phone: "" });
    } catch {
      toast.error(t("common.networkError"));
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" id="home">
        <h1 className="floating">{t("home.heroTitle")}</h1>
        <div className="hero-slogans">
          <span>{t("home.slogan1")}</span>
          <span className="hero-icon"> ✦ </span>
          <span>{t("home.slogan2")}</span>
          <span className="hero-icon"> ✦ </span>
          <span>{t("home.slogan3")}</span>
        </div>

        {/* ── Unified search bar (regular ↔ AI mode) ── */}
        <div
          className={`hero-search-bar${filledByAi ? " search-bar--ai-filled" : ""}${aiMode ? " hero-search-bar--ai-mode" : ""}`}
          role="search"
          aria-label={t("home.searchLabel")}
        >
          {aiMode ? (
            /* ── AI mode content ── */
            <>
              <button
                type="button"
                className="ai-back-btn"
                onClick={exitAiMode}
                aria-label={t("home.backToRegular")}
              >
                <X size={14} />
                <span>{t("common.back")}</span>
              </button>

              <Sparkles size={18} className="ai-mode-sparkle" />

              <input
                ref={aiInputRef}
                type="text"
                className="ai-mode-input"
                placeholder={t("home.aiPlaceholder")}
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
                  : t("home.analyze")}
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
                  placeholder={t("home.whereTo")}
                  value={destinationQuery}
                  onChange={(e) => { setDestinationQuery(e.target.value); setIsDestinationsOpen(true); }}
                  onFocus={() => setIsDestinationsOpen(true)}
                />
                {isDestinationsOpen && (
                  <div className="search-popover">
                    {destinationSuggestions.length > 0 ? (
                      destinationSuggestions.map((item) => (
                        <button key={item} type="button" className="search-suggestion-item"
                          onClick={() => { setDestinationQuery(tDest(item)); setIsDestinationsOpen(false); }}>
                          {tDest(item)}
                        </button>
                      ))
                    ) : (
                      <div className="search-suggestion-empty">{t("home.noDestinations")}</div>
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
                      <span>{t("common.selectDates")}</span>
                      <button type="button" className="popover-close"
                        onClick={() => setIsDatePickerOpen(false)} aria-label={t("common.close")}>
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
                      locale={isEn ? enUS : heLocale}
                    />
                    <div className="date-popover-actions">
                      <button type="button" className="popover-action-btn ghost"
                        onClick={() => { setIsDateActive(false); setIsDatePickerOpen(false); }}>
                        {t("common.clear")}
                      </button>
                      <button type="button" className="popover-action-btn"
                        onClick={() => setIsDatePickerOpen(false)}>
                        {t("common.confirm")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button type="button" className="search-submit-btn" onClick={startPlanning}>
                <Search size={18} />
                {t("home.searchBtn")}
              </button>

              {/* AI toggle button — lives inside the pill */}
              <button
                type="button"
                className="ai-pill-btn"
                onClick={() => { setAiMode(true); setAiError(null); }}
                title={t("home.aiTitle")}
              >
                <Sparkles size={15} />
                <span>{t("home.aiAgent")}</span>
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
              aria-label={t("home.clearAi")}
            >
              <X size={12} />
            </button>
          </div>
        )}
      </section>

      {/* Destinations Preview */}
      <section className="destinations" id="packages">
        <h2 className="section-title">{t("home.popular")}</h2>
        <div className="destinations-grid">
          {[
            { img: "/images/paris.jpg",     name: "פריז, צרפת",        descKey: "paris",     keyword: "פריז" },
            { img: "/images/rome.jpg",      name: "רומא, איטליה",      descKey: "rome",      keyword: "רומא" },
            { img: "/images/tokyo.jpg",     name: "טוקיו, יפן",        descKey: "tokyo",     keyword: "טוקיו" },
            { img: "/images/bali.jpg",      name: "באלי, אינדונזיה",   descKey: "bali",      keyword: "באלי" },
            { img: "/images/new-york.jpg",  name: 'ניו יורק, ארה"ב',   descKey: "newYork",   keyword: "ניו יורק" },
            { img: "/images/london.jpg",    name: "לונדון, אנגליה",    descKey: "london",    keyword: "לונדון" },
            { img: "/images/amsterdam.jpg", name: "אמסטרדם, הולנד",    descKey: "amsterdam", keyword: "אמסטרדם" },
            { img: "/images/barcelona.jpg", name: "ברצלונה, ספרד",     descKey: "barcelona", keyword: "ברצלונה" },
          ].map(({ img, name, descKey, keyword }) => ({ img, keyword, alt: tDest(name), title: tDest(name), desc: t(`home.dest.${descKey}`) }))
           .map(({ img, alt, title, desc, keyword }) => (
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
            <h2 className="title-light">{t("home.ourStory")}</h2>
            <p className="text-light">{t("home.storyText")}</p>
            <div className="mini-bullets">
              <div className="bullet">{t("home.bullet1")}</div>
              <div className="bullet">{t("home.bullet2")}</div>
              <div className="bullet">{t("home.bullet3")}</div>
            </div>
          </div>
        </div>

        <div className="side contact-side">
          <div className="side-content">
            <h2 className="title-dark">{t("home.talkToUs")}</h2>
            {splitSent ? (
              <p className="split-form-sent" role="status">{t("home.sent")}</p>
            ) : (
              <form className="split-form" onSubmit={submitSplitForm}>
                <input type="text" placeholder={t("common.fullName")} required minLength={2}
                  value={splitForm.name} onChange={(e) => setSplitForm((f) => ({ ...f, name: e.target.value }))} />
                <input type="tel" placeholder={t("common.phone")} required pattern="[0-9+\-\s()]{7,20}"
                  value={splitForm.phone} onChange={(e) => setSplitForm((f) => ({ ...f, phone: e.target.value }))} />
                <button type="submit">{t("home.send")}</button>
              </form>
            )}

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
