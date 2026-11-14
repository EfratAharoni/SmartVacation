import React, { useState, useEffect, useRef } from "react";
import { Users, HeartHandshake, Trophy, ShieldCheck } from "lucide-react";
import "./About.css";
import { useTranslation } from "react-i18next";


const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const AnimatedNumber = ({ value, inView }) => {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.]/g, "");
    const isDecimal = value.includes(".");
    const duration = 1800;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = eased * num;
      setDisplay((isDecimal ? cur.toFixed(1) : Math.floor(cur)) + suffix);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);
  return <span>{display}</span>;
};

const REVIEW_IMAGES = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/women/22.jpg",
  "https://randomuser.me/api/portraits/men/54.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
];
const VALUE_ICONS = [Users, HeartHandshake, Trophy, ShieldCheck];
const STAT_NUMBERS = ["10,000+", "150+", "5", "4.9"];

const About = () => {
  const { t, i18n } = useTranslation();
  const HERO_SUBTITLE = t("about.heroSubtitle");
  const [index, setIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [valuesRef, valuesInView] = useInView(0.15);
  const [statsRef, statsInView]   = useInView(0.3);

  useEffect(() => {
    let i = 0;
    let timerRef = null;
    setTypedText("");
    // restart the typing effect whenever the language changes
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        setTypedText(HERO_SUBTITLE.slice(0, i + 1));
        i++;
        if (i >= HERO_SUBTITLE.length) clearInterval(timer);
      }, 55);
      timerRef = timer;
    }, 600);
    return () => {
      clearTimeout(delay);
      if (timerRef) clearInterval(timerRef);
    };
  }, [HERO_SUBTITLE]);

  const nextSlide = () => setIndex((prev) => (prev + 1) % reviews.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  const values = (t("about.values", { returnObjects: true }) || []).map((v, i) => ({ ...v, icon: VALUE_ICONS[i] }));

  const stats = (t("about.stats", { returnObjects: true }) || []).map((label, i) => ({ number: STAT_NUMBERS[i], label }));

  const reviews = (t("about.reviews", { returnObjects: true }) || []).map((r, i) => ({ ...r, image: REVIEW_IMAGES[i] }));

  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
<div className="hero-content">
          <h1>{t("about.heroTitle")}</h1>
          <p className="hero-subtitle">
            {typedText}
            <span className="typing-cursor" aria-hidden="true">|</span>
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="story-container">
          <div className="story-content">
            <h2>{t("about.whoWeAre")}</h2>
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <p>{t("about.p3")}</p>
          </div>
          <div className="story-image">
            <img
              src="/images/vacation-hero.jpg"
              alt="Vacation destination"
              className="story-img"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div ref={valuesRef} className="values-container">
          <h2 className={`section-title reveal ${valuesInView ? "visible" : ""}`}>{t("about.ourValues")}</h2>
          <div className="values-grid">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div
                  key={i}
                  className={`value-card reveal ${valuesInView ? "visible" : ""}`}
                  style={{ "--reveal-delay": `${i * 0.12}s` }}
                >
                  <div className="value-icon">
                    <Icon size={40} color="#667eea" />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pro-testimonials">
        <div className="pro-container">
          <h2 className="section-title">{t("about.testimonials")}</h2>
          <div className="pro-slider-wrapper">
            <button className="nav-btn left" onClick={() => setIndex((index - 1 + reviews.length) % reviews.length)}>‹</button>
            <div className="pro-slider">
              {Array.from({ length: 3 }).map((_, i) => {
                const r = reviews[(index + i) % reviews.length];
                return (
                  <div key={`${i18n.language}-${i}`} className="pro-card">
                    <div className="pro-header">
                      <img src={r.image} alt={r.name} />
                      <strong>{r.name}</strong>
                    </div>
                    <div className="stars">★★★★★</div>
                    <p>"{r.text}"</p>
                    <div className="pro-footer">
                      <span>{r.location}</span>
                      <span>{r.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="nav-btn right" onClick={() => setIndex((index + 1) % reviews.length)}>›</button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div ref={statsRef} className="stats-container">
          <h2 className="section-title">{t("about.numbers")}</h2>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`stat-card reveal ${statsInView ? "visible" : ""}`}
                style={{ "--reveal-delay": `${i * 0.13}s` }}
              >
                <div className="stat-number">
                  <AnimatedNumber value={stat.number} inView={statsInView} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
