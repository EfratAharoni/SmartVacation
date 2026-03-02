import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, HeartHandshake, Trophy, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import "./About.css";

const About = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

const [index, setIndex] = useState(0);
const [isHovered, setIsHovered] = useState(false);

const nextSlide = () => {
  setIndex((prev) => (prev + 1) % reviews.length);
};

const prevSlide = () => {
  setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
};

useEffect(() => {
  if (isHovered) return;

  const interval = setInterval(nextSlide, 4000);
  return () => clearInterval(interval);
}, [isHovered]);

  const values = [
    {
      icon: Users,
      title: "מקצועיות",
      description: "אנחנו מביאים ניסיון של שנים בתחום התיירות והנופש",
    },
    {
      icon: HeartHandshake,
      title: "אכפתיות",
      description: "החופשה שלכם חשובה לנו כאילו הייתה החופשה שלנו",
    },
    {
      icon: Trophy,
      title: "מצוינות",
      description: "אנחנו שואפים למצוינות בכל שירות ובכל פרט",
    },
    {
      icon: ShieldCheck,
      title: "אמינות",
      description: "שקיפות מלאה ללא הפתעות או עלויות נסתרות",
    },
  ];

  const stats = [
    {
      number: "10,000+",
      label: "משתמשים מרוצים",
    },
    {
      number: "150+",
      label: "יעדים ברחבי העולם",
    },
    {
      number: "5",
      label: "שנות ניסיון",
    },
    {
      number: "4.9",
      label: "דירוג ממוצע",
    },
  ];

  //   const team = [
  //     {
  //       name: "דני כהן",
  //       role: 'מייסד ומנכ"ל',
  //       image: "👨‍💼",
  //       description: "בעל ניסיון של 15 שנה בתחום התיירות",
  //     },
  //     {
  //       name: "שרה לוי",
  //       role: "מנהלת שירות לקוחות",
  //       image: "👩‍💼",
  //       description: "מתמחה ביצירת חוויות לקוח מושלמות",
  //     },
  //     {
  //       name: "יוסי ברקוביץ",
  //       role: "מנהל מכירות",
  //       image: "👨‍💻",
  //       description: "מומחה לתכנון טיולים מותאמים אישית",
  //     },
  //   ];

const reviews = [
  {
    name: "נועה כהן",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "בנינו חופשה לפריז תוך דקות. הכל היה פשוט, זול וברור.",
    location: "פריז, צרפת",
    date: "ינואר 2026",
  },
  {
    name: "יובל לוי",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "חסכנו מאות שקלים על חבילת נופש לברצלונה.",
    location: "ברצלונה, ספרד",
    date: "דצמבר 2025",
  },
  {
    name: "מיכל אברהם",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    text: "החופשה בדובאי הייתה מושלמת מהטיסה ועד המלון.",
    location: "דובאי, איחוד האמירויות",
    date: "נובמבר 2025",
  },
  {
    name: "דניאל פרץ",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    text: "האתר הכי נוח שמצאתי להזמנת חופשות.",
    location: "רומא, איטליה",
    date: "אוקטובר 2025",
  },
  {
    name: "שירה בן דוד",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    text: "השוואת המחירים חסכה לנו המון כסף.",
    location: "לונדון, בריטניה",
    date: "ספטמבר 2025",
  },
  {
    name: "איתי מזרחי",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
    text: "מצאנו טיסות ומלון מושלמים תוך כמה דקות.",
    location: "ברלין, גרמניה",
    date: "אוגוסט 2025",
  },
  {
    name: "לירון אוחנה",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    text: "אין ספק שזה האתר הכי נוח להזמנת חופשות.",
    location: "אתונה, יוון",
    date: "יולי 2025",
  },
];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>הסיפור שלנו</h1>
          <p>מחלום קטן לפלטפורמה מובילה לתכנון חופשות</p>
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
          {/* <div className="story-image">
            <div className="image-placeholder">
              <span className="placeholder-icon">✈️</span>
            </div>
          </div> */}
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
        {/* <div className="values-container">
          <h2 className="section-title">הערכים שלנו</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div> */}
        <div className="values-container">
          <h2 className="section-title">הערכים שלנו</h2>
          <div className="values-grid">
            {values.map((value, index) => {
              const Icon = value.icon; // יוצרים קומפוננטה מהאייקון
              return (
                <div key={index} className="value-card">
                  <div className="value-icon">
                    <Icon size={40} color="#667eea" />{" "}
                    {/* ניתן לשנות צבע וגודל */}
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

{/* Testimonials PRO — 3 cards visible, move 1 at a time */}
<section className="pro-testimonials">
  <div className="pro-container">
    <h2 className="section-title">לקוחות משתפים</h2>

    <div className="pro-slider-wrapper">
      {/* כפתור אחורה */}
      <button className="nav-btn left" onClick={() => setIndex((index - 1 + reviews.length) % reviews.length)}>
        ‹
      </button>

      {/* Slider */}
      <div className="pro-slider">
        {Array.from({ length: 3 }).map((_, i) => {
          const r = reviews[(index + i) % reviews.length]; // תצוגה סיבובית
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

      {/* כפתור קדימה */}
      <button className="nav-btn right" onClick={() => setIndex((index + 1) % reviews.length)}>
        ›
      </button>
    </div>
  </div>
</section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <h2 className="section-title">המספרים מדברים בעד עצמם</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      {/* <section className="mission-section">
        <div className="mission-container">
          <div className="mission-content">
            <h2>המשימה שלנו</h2>
            <p>
              אנחנו מאמינים שכל אחד ראוי לחופשה מושלמת. המטרה שלנו היא להפוך את
              תכנון הטיולים לפשוט, נגיש ומהנה עבור כולם.
            </p>
            <p>
              אנחנו עובדים קשה כדי למצוא עבורכם את המחירים הטובים ביותר, היעדים
              המדהימים ביותר והחוויות הבלתי נשכחות ביותר.
            </p>
          </div>
        </div>
      </section> */}

      {/* Team Section */}
      {/* <section className="team-section">
        <div className="team-container">
          <h2 className="section-title">הצוות שלנו</h2>
          <p className="team-intro">
            הצוות המקצועי שלנו כאן כדי להפוך את החופשה שלכם למציאות
          </p>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image">{member.image}</div>
                <h3>{member.name}</h3>
                <div className="team-role">{member.role}</div>
                <p>{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="cta-section">
        <div className="cta-container">
          <h2>?מוכנים להתחיל</h2>
          <p>בואו נתכנן ביחד את החופשה המושלמת שלכם</p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              גלה יעדים
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/contact")}
            >
              צור קשר
            </button>
          </div>
        </div>
      </section> */}

    </div>
  );
};

export default About;
