import React, { useState, useEffect, useRef } from "react";
import { Users, HeartHandshake, Trophy, ShieldCheck } from "lucide-react";
import "./About.css";


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

const HERO_SUBTITLE = "מחלום קטן לפלטפורמה מובילה לתכנון חופשות";

const About = () => {
  const [index, setIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [valuesRef, valuesInView] = useInView(0.15);
  const [statsRef, statsInView]   = useInView(0.3);

  useEffect(() => {
    let i = 0;
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        setTypedText(HERO_SUBTITLE.slice(0, i + 1));
        i++;
        if (i >= HERO_SUBTITLE.length) clearInterval(timer);
      }, 55);
      return () => clearInterval(timer);
    }, 600);
    return () => clearTimeout(delay);
  }, []);

  const nextSlide = () => setIndex((prev) => (prev + 1) % reviews.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  const values = [
    { icon: Users,         title: "מקצועיות", description: "אנחנו מביאים ניסיון של שנים בתחום התיירות והנופש" },
    { icon: HeartHandshake, title: "אכפתיות", description: "החופשה שלכם חשובה לנו כאילו הייתה החופשה שלנו" },
    { icon: Trophy,         title: "מצוינות",  description: "אנחנו שואפים למצוינות בכל שירות ובכל פרט" },
    { icon: ShieldCheck,    title: "אמינות",   description: "שקיפות מלאה ללא הפתעות או עלויות נסתרות" },
  ];

  const stats = [
    { number: "10,000+", label: "משתמשים מרוצים" },
    { number: "150+",    label: "יעדים ברחבי העולם" },
    { number: "5",       label: "שנות ניסיון" },
    { number: "4.9",     label: "דירוג ממוצע" },
  ];

  const reviews = [
    { name: "נועה כהן",    image: "https://randomuser.me/api/portraits/women/44.jpg", text: "בנינו חופשה לפריז תוך דקות. הכל היה פשוט, זול וברור.",         location: "פריז, צרפת",             date: "ינואר 2026"  },
    { name: "יובל לוי",    image: "https://randomuser.me/api/portraits/men/32.jpg",   text: "חסכנו מאות שקלים על חבילת נופש לברצלונה.",                   location: "ברצלונה, ספרד",          date: "דצמבר 2025" },
    { name: "מיכל אברהם",  image: "https://randomuser.me/api/portraits/women/65.jpg", text: "החופשה בדובאי הייתה מושלמת מהטיסה ועד המלון.",               location: "דובאי, איחוד האמירויות", date: "נובמבר 2025" },
    { name: "דניאל פרץ",   image: "https://randomuser.me/api/portraits/men/11.jpg",   text: "האתר הכי נוח שמצאתי להזמנת חופשות.",                        location: "רומא, איטליה",           date: "אוקטובר 2025"},
    { name: "שירה בן דוד", image: "https://randomuser.me/api/portraits/women/22.jpg", text: "השוואת המחירים חסכה לנו המון כסף.",                          location: "לונדון, בריטניה",        date: "ספטמבר 2025" },
    { name: "איתי מזרחי",  image: "https://randomuser.me/api/portraits/men/54.jpg",   text: "מצאנו טיסות ומלון מושלמים תוך כמה דקות.",                   location: "ברלין, גרמניה",          date: "אוגוסט 2025"  },
    { name: "לירון אוחנה", image: "https://randomuser.me/api/portraits/women/12.jpg", text: "אין ספק שזה האתר הכי נוח להזמנת חופשות.",                   location: "אתונה, יוון",            date: "יולי 2025"    },
  ];

  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
<div className="hero-content">
          <h1>הסיפור שלנו</h1>
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
            <h2>מי אנחנו</h2>
            <p>
              הרעיון שלנו התחיל מתוך אהבה אמיתית לטיולים ורצון לשנות את הדרך שבה
              אנשים מתכננים את החופשות שלהם. התחלנו כצוות קטן של חובבי טיולים
              שהבינו שתכנון חופשה לא צריך להיות מסובך, יקר או מלחיץ.
            </p>
            <p>
              היום, אנחנו גאים לשרת אלפי לקוחות מרוצים מדי שנה, ומציעים מגוון
              רחב של יעדים, חבילות נופש ואטרקציות ברחבי העולם. המשימה שלנו
              פשוטה: לעזור לכם ליצור זיכרונות בלתי נשכחים תוך חיסכון בזמן ובכסף.
            </p>
            <p>
              אנחנו משלבים טכנולוגיה מתקדמת עם שירות אישי, כדי להבטיח שכל חופשה
              תהיה בדיוק מה שחלמתם עליה - ואפילו יותר.
            </p>
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
          <h2 className={`section-title reveal ${valuesInView ? "visible" : ""}`}>הערכים שלנו</h2>
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
          <h2 className="section-title">לקוחות משתפים</h2>
          <div className="pro-slider-wrapper">
            <button className="nav-btn left" onClick={() => setIndex((index - 1 + reviews.length) % reviews.length)}>‹</button>
            <div className="pro-slider">
              {Array.from({ length: 3 }).map((_, i) => {
                const r = reviews[(index + i) % reviews.length];
                return (
                  <div key={i} className="pro-card">
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
          <h2 className="section-title">המספרים מדברים בעד עצמם</h2>
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
