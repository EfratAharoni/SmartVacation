import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Attractions.css";

const Attractions = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);

  const attractions = [
    // אירופה
    {
      id: 1,
      name: "מגדל אייפל",
      location: "פריז, צרפת",
      category: "landmarks",
      price: 150,
      duration: "2-3 שעות",
      rating: 4.8,
      image: "/images/eiffel-tower.jpg",
      description: "סמל העיר פריז המפורסם, גובה 330 מטר עם נוף מרהיב על העיר",
      highlights: ["נוף פנורמי", "תצפית מהקומה העליונה", "מסעדה יוקרתית"],
    },
    {
      id: 2,
      name: "הקולוסיאום",
      location: "רומא, איטליה",
      category: "landmarks",
      price: 120,
      duration: "2-3 שעות",
      rating: 4.9,
      image: "/images/colosseum.jpg",
      description: "אמפיתיאטרון עתיק מרשים, אחד משבעת פלאי העולם",
      highlights: ["היסטוריה עתיקה", "סיורים מודרכים", "אדריכלות רומית"],
    },
    {
      id: 3,
      name: "סגרדה פמיליה",
      location: "ברצלונה, ספרד",
      category: "landmarks",
      price: 95,
      duration: "1-2 שעות",
      rating: 4.7,
      image: "/images/sagrada-familia.jpg",
      description: "בזיליקה מדהימה בעיצוב אנטוני גאודי, בניה מתמשכת מ-1882",
      highlights: ["אדריכלות ייחודית", "ויטראז'ים צבעוניים", "מבנה איקוני"],
    },
    {
      id: 4,
      name: "לובר",
      location: "פריז, צרפת",
      category: "museums",
      price: 135,
      duration: "3-4 שעות",
      rating: 4.8,
      image: "/images/louvre.jpg",
      description: "המוזיאון הגדול והמפורסם בעולם, ביתה של המונה ליזה",
      highlights: ["אוסף אמנות עצום", "יצירות מופת", "פירמידת זכוכית"],
    },
    // אסיה
    {
      id: 5,
      name: "טוקיו סקייטרי",
      location: "טוקיו, יפן",
      category: "landmarks",
      price: 180,
      duration: "2 שעות",
      rating: 4.6,
      image: "/images/tokyo-skytree.jpg",
      description: "המגדל הגבוה בעולם (634 מטר) עם תצפית מרהיבה",
      highlights: ["תצפית 360 מעלות", "רצפת זכוכית", "קניון ענק"],
    },
    {
      id: 6,
      name: "מקדש אנגקור וואט",
      location: "סיאם ריפ, קמבודיה",
      category: "temples",
      price: 90,
      duration: "4-5 שעות",
      rating: 4.9,
      image: "/images/angkor-wat.jpg",
      description: "מתחם מקדשים עתיק ומרשים, אתר מורשת עולמית",
      highlights: ["זריחה מרהיבה", "ארכיאולוגיה", "ג'ונגל טרופי"],
    },
    {
      id: 7,
      name: "חומת סין הגדולה",
      location: "בייג'ינג, סין",
      category: "landmarks",
      price: 110,
      duration: "3-4 שעות",
      rating: 4.8,
      image: "/images/great-wall.jpg",
      description: "אחד משבעת פלאי העולם, מבנה הגנה עתיק ומרשים",
      highlights: ["נוף הררי", "היסטוריה עשירה", "צילומים מרהיבים"],
    },
    {
      id: 8,
      name: "טאג' מהאל",
      location: "אגרה, הודו",
      category: "landmarks",
      price: 75,
      duration: "2-3 שעות",
      rating: 4.9,
      image: "/images/taj-mahal.jpg",
      description: "ארמון שיש לבן מרהיב, סמל לאהבה נצחית",
      highlights: ["אדריכלות מוגולית", "גנים מטופחים", "שקיעה קסומה"],
    },
    // אמריקה
    {
      id: 9,
      name: "פסל החירות",
      location: 'ניו יורק, ארה"ב',
      category: "landmarks",
      price: 145,
      duration: "2-3 שעות",
      rating: 4.7,
      image: "/images/statue-liberty.jpg",
      description: "סמל החופש האמריקאי, מתנה מצרפת",
      highlights: ["שייט באוניה", "מוזיאון", "נוף על מנהטן"],
    },
    {
      id: 10,
      name: "מפלי ניאגרה",
      location: "ניו יורק/אונטריו",
      category: "nature",
      price: 95,
      duration: "3-4 שעות",
      rating: 4.8,
      image: "/images/niagara-falls.jpg",
      description: 'מפלים מרהיבים בגבול ארה"ב-קנדה',
      highlights: ["שייט מתחת למפלים", "תצפיות מרהיבות", "תאורה לילית"],
    },
    {
      id: 11,
      name: "מאצ'ו פיצ'ו",
      location: "קוסקו, פרו",
      category: "landmarks",
      price: 200,
      duration: "יום שלם",
      rating: 4.9,
      image: "/images/machu-picchu.jpg",
      description: "עיר האינקה המסתורית בין ההרים",
      highlights: ["טיפוס הררי", "חורבות עתיקות", "נוף עוצר נשימה"],
    },
    {
      id: 12,
      name: "גראנד קניון",
      location: 'אריזונה, ארה"ב',
      category: "nature",
      price: 120,
      duration: "4-5 שעות",
      rating: 4.8,
      image: "/images/grand-canyon.jpg",
      description: "קניון עצום ומרהיב, פלא טבע אמיתי",
      highlights: ["מסלולי הליכה", "שקיעות מדהימות", "גשר זכוכית"],
    },
    // אוקיאניה ואפריקה
    {
      id: 13,
      name: "בית האופרה של סידני",
      location: "סידני, אוסטרליה",
      category: "landmarks",
      price: 110,
      duration: "1-2 שעות",
      rating: 4.7,
      image: "/images/sydney-opera.jpg",
      description: "מבנה אייקוני בעיצוב ייחודי על שפת הים",
      highlights: ["אדריכלות מודרנית", "סיורים מודרכים", "הופעות"],
    },
    {
      id: 14,
      name: "הפירמידות של גיזה",
      location: "קהיר, מצרים",
      category: "landmarks",
      price: 85,
      duration: "3-4 שעות",
      rating: 4.9,
      image: "/images/pyramids.jpg",
      description: "הפירמידות העתיקות והספינקס המפורסם",
      highlights: ["היסטוריה עתיקה", "ספינקס", "רכיבה על גמלים"],
    },
    {
      id: 15,
      name: "סאגרי פארק",
      location: "קייפטאון, דרום אפריקה",
      category: "nature",
      price: 250,
      duration: "יום שלם",
      rating: 4.8,
      image: "/images/safari.jpg",
      description: "ספארי בר עם חיות בר באפריקה",
      highlights: ["אריות", "פילים", "ג'ירפות", "נוף אפריקאי"],
    },
    {
      id: 16,
      name: "הגשר הזהוב",
      location: 'סן פרנסיסקו, ארה"ב',
      category: "landmarks",
      price: 65,
      duration: "1-2 שעות",
      rating: 4.6,
      image: "/images/golden-gate.jpg",
      description: "גשר התליה האייקוני בצבע אדום-כתום",
      highlights: ["הליכה על הגשר", "צילומים", "רכיבת אופניים"],
    },
    // אטרקציות נוספות (17–36)
    {
      id: 17,
      name: "מוזיאון ד'אורסה",
      location: "פריז, צרפת",
      category: "museums",
      price: 110,
      duration: "2-3 שעות",
      rating: 4.8,
      image: "/images/orsay.jpg",
      description:
        "מוזיאון אומנות בתחנת רכבת היסטורית עם יצירות אימפרסיוניסטיות",
      highlights: ["מונה", "ואן גוך", "מבנה ייחודי"],
    },
    {
      id: 18,
      name: "שער הניצחון",
      location: "פריז, צרפת",
      category: "landmarks",
      price: 70,
      duration: "1-2 שעות",
      rating: 4.7,
      image: "/images/arc-triomphe.jpg",
      description: "אנדרטה מפוארת במרכז כיכר שארל דה גול",
      highlights: ["תצפית על השאנז אליזה", "היסטוריה צרפתית"],
    },
    {
      id: 19,
      name: "הוותיקן",
      location: "רומא, איטליה",
      category: "landmarks",
      price: 130,
      duration: "3-4 שעות",
      rating: 4.9,
      image: "/images/vatican.jpg",
      description: "מדינת העיר הקטנה בעולם ומרכז הנצרות הקתולית",
      highlights: ["כנסיית פטרוס הקדוש", "קפלה סיסטינית"],
    },
    {
      id: 20,
      name: "מזרקת טרווי",
      location: "רומא, איטליה",
      category: "landmarks",
      price: 0,
      duration: "1 שעה",
      rating: 4.8,
      image: "/images/trevi.jpg",
      description: "המזרקה המפורסמת שבה זורקים מטבע לחזרה לרומא",
      highlights: ["אדריכלות בארוקית", "צילום לילה"],
    },
    {
      id: 21,
      name: "שיבויה קרוסינג",
      location: "טוקיו, יפן",
      category: "landmarks",
      price: 0,
      duration: "1 שעה",
      rating: 4.7,
      image: "/images/shibuya.jpg",
      description: "מעבר החצייה העמוס בעולם",
      highlights: ["אורות ניאון", "קניות", "אווירה אורבנית"],
    },
    {
      id: 22,
      name: "מקדש סנסו-ג'י",
      location: "טוקיו, יפן",
      category: "temples",
      price: 0,
      duration: "1-2 שעות",
      rating: 4.8,
      image: "/images/sensoji.jpg",
      description: "המקדש הבודהיסטי העתיק ביותר בטוקיו",
      highlights: ["שער קמינרימון", "דוכני מזכרות"],
    },
    {
      id: 23,
      name: "מקדש אולוואטו",
      location: "באלי, אינדונזיה",
      category: "temples",
      price: 60,
      duration: "2 שעות",
      rating: 4.7,
      image: "/images/uluwatu.jpg",
      description: "מקדש על צוק מעל האוקיינוס",
      highlights: ["שקיעה מרהיבה", "ריקוד קצ'אק"],
    },
    {
      id: 24,
      name: "יער הקופים אובוד",
      location: "באלי, אינדונזיה",
      category: "nature",
      price: 55,
      duration: "2 שעות",
      rating: 4.6,
      image: "/images/monkey-forest.jpg",
      description: "שמורת טבע עם מאות קופים",
      highlights: ["ג'ונגל טרופי", "מקדשים עתיקים"],
    },
    {
      id: 25,
      name: "סנטרל פארק",
      location: 'ניו יורק, ארה"ב',
      category: "nature",
      price: 0,
      duration: "2-3 שעות",
      rating: 4.9,
      image: "/images/central-park.jpg",
      description: "פארק עירוני עצום בלב מנהטן",
      highlights: ["אגמים", "פיקניקים", "השכרת אופניים"],
    },
    {
      id: 26,
      name: "טיימס סקוור",
      location: 'ניו יורק, ארה"ב',
      category: "landmarks",
      price: 0,
      duration: "1-2 שעות",
      rating: 4.7,
      image: "/images/times-square.jpg",
      description: "כיכר מוארת במסכי ענק ושלטי פרסום",
      highlights: ["חנויות", "תיאטראות ברודוויי"],
    },
    {
      id: 27,
      name: "ארמון בקינגהאם",
      location: "לונדון, אנגליה",
      category: "landmarks",
      price: 95,
      duration: "2 שעות",
      rating: 4.6,
      image: "/images/buckingham.jpg",
      description: "מעון המלוכה הבריטי",
      highlights: ["החלפת המשמר", "גנים מלכותיים"],
    },
    {
      id: 28,
      name: "הלונדון איי",
      location: "לונדון, אנגליה",
      category: "landmarks",
      price: 120,
      duration: "1 שעה",
      rating: 4.7,
      image: "/images/london-eye.jpg",
      description: "גלגל ענק עם תצפית על העיר",
      highlights: ["תא זכוכית", "נהר התמזה"],
    },
    {
      id: 29,
      name: "רייקסמוזיאום",
      location: "אמסטרדם, הולנד",
      category: "museums",
      price: 110,
      duration: "2-3 שעות",
      rating: 4.8,
      image: "/images/rijksmuseum.jpg",
      description: "המוזיאון הלאומי של הולנד",
      highlights: ["רמברנדט", "אמנות הולנדית"],
    },
    {
      id: 30,
      name: "בית אנה פרנק",
      location: "אמסטרדם, הולנד",
      category: "museums",
      price: 85,
      duration: "1-2 שעות",
      rating: 4.9,
      image: "/images/anne-frank.jpg",
      description: "בית המחבוא שבו הסתתרה אנה פרנק",
      highlights: ["היסטוריה מרגשת", "תערוכה אינטראקטיבית"],
    },
    {
      id: 31,
      name: "פארק גואל",
      location: "ברצלונה, ספרד",
      category: "landmarks",
      price: 80,
      duration: "2 שעות",
      rating: 4.8,
      image: "/images/park-guell.jpg",
      description: "פארק צבעוני בעיצוב גאודי",
      highlights: ["פסיפסים", "נוף לעיר"],
    },
    {
      id: 32,
      name: "לה רמבלה",
      location: "ברצלונה, ספרד",
      category: "landmarks",
      price: 0,
      duration: "1-2 שעות",
      rating: 4.6,
      image: "/images/ramblas.jpg",
      description: "שדרה תוססת עם חנויות ואמני רחוב",
      highlights: ["שווקים", "מסעדות", "הופעות רחוב"],
    },
    {
      id: 33,
      name: "מונמארטר",
      location: "פריז, צרפת",
      category: "landmarks",
      price: 0,
      duration: "2 שעות",
      rating: 4.7,
      image: "/images/montmartre.jpg",
      description: "רובע אמנים ציורי על גבעה",
      highlights: ["בזיליקת סקרה קר", "סמטאות ציוריות"],
    },
    {
      id: 34,
      name: "פיאצה נבונה",
      location: "רומא, איטליה",
      category: "landmarks",
      price: 0,
      duration: "1 שעה",
      rating: 4.7,
      image: "/images/navona.jpg",
      description: "כיכר יפה עם מזרקות וארמונות",
      highlights: ["אמני רחוב", "בתי קפה"],
    },
    {
      id: 35,
      name: "מגדל טוקיו",
      location: "טוקיו, יפן",
      category: "landmarks",
      price: 95,
      duration: "1-2 שעות",
      rating: 4.6,
      image: "/images/tokyo-tower.jpg",
      description: "מגדל תצפית אדום בהשראת מגדל אייפל",
      highlights: ["תצפית פנורמית", "תאורת לילה"],
    },
    {
      id: 36,
      name: "חוף קוטה",
      location: "באלי, אינדונזיה",
      category: "nature",
      price: 0,
      duration: "3-4 שעות",
      rating: 4.5,
      image: "/images/kuta.jpg",
      description: "חוף פופולרי לגלישה ושקיעות",
      highlights: ["גלים טובים לגלישה", "חיי לילה"],
    },
  ];

  const categories = [
    { id: "all", name: "הכל", icon: "🌍" },
    { id: "landmarks", name: "ציוני דרך", icon: "🏛️" },
    { id: "museums", name: "מוזיאונים", icon: "🖼️" },
    { id: "nature", name: "טבע", icon: "🏞️" },
    { id: "temples", name: "מקדשים", icon: "⛩️" },
    { id: "free", name: "חינם", icon: "🆓" },
  ];

  useEffect(() => {
    filterAttractions();
  }, [selectedCategory, searchTerm]);

  const filterAttractions = () => {
  let filtered = attractions;

  if (selectedCategory !== "all") {
    if (selectedCategory === "free") {
      filtered = filtered.filter((attr) => attr.price === 0); 
    } else {
      filtered = filtered.filter((attr) => attr.category === selectedCategory);
    }
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (attr) =>
        attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attr.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  setFilteredAttractions(filtered);
};

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

  const openAttractionModal = (attraction) => {
    setSelectedAttraction(attraction);
  };

  const closeAttractionModal = () => {
    setSelectedAttraction(null);
  };

  const handleBooking = () => {
    alert(`הוזמנה אטרקציה: ${selectedAttraction.name}`);
    closeAttractionModal();
  };

  return (
    <div className="attractions-page">
      <Header currentPage="attractions" />

      {/* Hero Section */}
      <section className="attractions-hero">
        <div className="hero-content">
          <h1 className="floating">גלה את האטרקציות המדהימות בעולם</h1>
          <p>חוויות בלתי נשכחות בכל פינה בעולם</p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="filter-section">
        <div className="filter-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="חפש אטרקציה או יעד..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="attractions-grid-section">
        <div className="results-count">
          <h2>נמצאו {filteredAttractions.length} אטרקציות</h2>
        </div>

        <div className="attractions-grid">
          {filteredAttractions.map((attraction) => (
            <div
              key={attraction.id}
              className="attraction-card"
              onClick={() => openAttractionModal(attraction)}
            >
              <div className="attraction-image">
                <img src={attraction.image} alt={attraction.name} />
                <div className="attraction-badge">
                  <span>⭐ {attraction.rating}</span>
                </div>
              </div>
              <div className="attraction-content">
                <h3>{attraction.name}</h3>
                <p className="location">📍 {attraction.location}</p>
                <div className="attraction-details">
                  <span className="price">₪{attraction.price}</span>
                  <span className="duration">⏱️ {attraction.duration}</span>
                </div>
                <button className="book-btn">הזמן עכשיו</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedAttraction && (
        <div className="modal-overlay" onClick={closeAttractionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeAttractionModal}>
              ✕
            </button>
            <div className="modal-image">
              <img
                src={selectedAttraction.image}
                alt={selectedAttraction.name}
              />
            </div>
            <div className="modal-info">
              <h2>{selectedAttraction.name}</h2>
              <p className="modal-location">📍 {selectedAttraction.location}</p>
              <div className="modal-rating">
                <span>⭐ {selectedAttraction.rating}</span>
              </div>
              <p className="modal-description">
                {selectedAttraction.description}
              </p>
              <div className="modal-highlights">
                <h4>מה כלול:</h4>
                <ul>
                  {selectedAttraction.highlights.map((highlight, index) => (
                    <li key={index}>✓ {highlight}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <div className="modal-price">
                  <span className="price-label">מחיר:</span>
                  <span className="price-value">
                    ₪{selectedAttraction.price}
                  </span>
                </div>
                <div className="modal-duration">
                  <span>⏱️ משך: {selectedAttraction.duration}</span>
                </div>
              </div>
              <button className="modal-book-btn" onClick={handleBooking}>
                הזמן עכשיו
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <a onClick={() => navigate("/")}>עמוד הבית</a>
            <a onClick={() => navigate("/")}>אודות</a>
            <a onClick={() => navigate("/")}>חבילות</a>
            <a className="active">אטרקציות</a>
            <a onClick={() => navigate("/contact")}>צור קשר</a>
            <a href="#">תנאי שימוש</a>
            <a href="#">פרטיות</a>
          </div>
          <p>&copy; 2026 Smart Vacation Planner. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
};

export default Attractions;
