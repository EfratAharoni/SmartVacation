import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Globe, Landmark, Images, Trees, Building2, Gift, Star, MapPin } from "lucide-react";
import "./Attractions.css";

const getUserKey = () => {
  const name = localStorage.getItem("userName");
  return name ? name.replace(/\s/g, "_") : "guest";
};

const Attractions = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [attractions, setAttractions] = useState([]); // הנתונים מגיעים מכאן
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [bookingAttraction, setBookingAttraction] = useState(null);
  const [bookingQty, setBookingQty] = useState({ adults: 1, children: 0, infants: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "הכל", icon: Globe },
    { id: "landmarks", name: "ציוני דרך", icon: Landmark },
    { id: "museums", name: "מוזיאונים", icon: Images },
    { id: "nature", name: "טבע", icon: Trees },
    { id: "temples", name: "מקדשים", icon: Building2 },
    { id: "free", name: "חינם", icon: Gift },
  ];

  // טעינת נתונים מהשרת וטעינת נתוני משתמש
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/attractions`);
        if (!response.ok) {
          throw new Error("Failed to fetch attractions");
        }
        const data = await response.json();
        setAttractions(data);
        setFilteredAttractions(data);
      } catch (error) {
        console.error("שגיאה במשיכת הנתונים מהשרת:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();

    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const userKey = getUserKey();
      const savedFavs = JSON.parse(localStorage.getItem(`favorites_${userKey}`) || "[]");
      const savedCart = JSON.parse(localStorage.getItem(`cart_${userKey}`) || "[]");
      setFavorites(savedFavs);
      setCart(savedCart);
    }
  }, [API_BASE_URL]);

  // סינון אטרקציות
  useEffect(() => {
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
  }, [selectedCategory, searchTerm, attractions]);

  // פונקציית מועדפים - משתמשת ב _id
  const toggleFavorite = (attractionId) => {
    if (!isLoggedIn) {
      alert("כדי להוסיף למועדפים יש להתחבר תחילה");
      navigate("/login");
      return;
    }
    
    const userKey = getUserKey();
    const attraction = attractions.find(a => a._id === attractionId);
    
    if (!attraction) return;
    
    const isAlreadyFavorite = favorites.some(fav => fav._id === attractionId);
    
    const updated = isAlreadyFavorite
      ? favorites.filter(fav => fav._id !== attractionId)
      : [...favorites, { ...attraction, type: 'attraction' }]; 

    setFavorites(updated);
    localStorage.setItem(`favorites_${userKey}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("userDataUpdated"));
  };

  const getChildPrice = (attraction) =>
    attraction.childPrice != null
      ? attraction.childPrice
      : Math.round(attraction.price * 0.6);

  const calcAttractionTotal = (attraction, qty) => {
    if (attraction.price === 0) return 0;
    const adultTotal = attraction.price * qty.adults;
    const childTotal = getChildPrice(attraction) * qty.children;
    return adultTotal + childTotal; // תינוקות תמיד חינם
  };

  const openAttractionBooking = (attraction, e) => {
    e?.stopPropagation();
    if (!isLoggedIn) {
      alert("כדי להזמין יש להתחבר תחילה");
      navigate("/login");
      return;
    }
    setBookingQty({ adults: 1, children: 0, infants: 0 });
    setBookingAttraction(attraction);
    setSelectedAttraction(null);
  };

  const confirmAttractionBooking = () => {
    const userKey = getUserKey();
    const alreadyIn = cart.some(
      (item) => item._id === bookingAttraction._id && item.type === "attraction"
    );
    if (alreadyIn) {
      alert(`${bookingAttraction.name} כבר נמצא בעגלה שלך!`);
      return;
    }
    const totalPrice = calcAttractionTotal(bookingAttraction, bookingQty);
    const updated = [
      ...cart,
      {
        ...bookingAttraction,
        type: "attraction",
        addedAt: new Date().toISOString(),
        bookingQty: { ...bookingQty },
        totalPrice,
      },
    ];
    setCart(updated);
    localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("userDataUpdated"));
    setBookingAttraction(null);
    alert(`${bookingAttraction.name} נוסף לעגלה! 🛒`);
  };

  const openAttractionModal = (attraction) => setSelectedAttraction(attraction);
  const closeAttractionModal = () => setSelectedAttraction(null);

  // SVG לב
  const HeartSVG = ({ filled }) => (
    <svg
      viewBox="0 0 24 24"
      className="heart-icon"
      aria-hidden="true"
      style={{
        fill: filled ? "#e63946" : "transparent",
        stroke: filled ? "#e63946" : "rgba(255,255,255,0.95)",
        strokeWidth: 1.8,
        strokeLinejoin: "round",
        width: 22,
        height: 22,
        transition: "fill 0.25s, stroke 0.25s",
      }}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
               2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
               C13.09 3.81 14.76 3 16.5 3
               19.58 3 22 5.42 22 8.5
               c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  if (loading) return <div className="loader" style={{textAlign: "center", padding: "50px", fontSize: "20px"}}>טוען אטרקציות...</div>;

  return (
    <div className="attractions-page">
      {/* Hero */}
      <section className="attractions-hero">
        <div className="hero-content">
          <h1 className="floating">גלה את האטרקציות המדהימות בעולם</h1>
          <p>חוויות בלתי נשכחות בכל פינה בעולם</p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="filter-section">
        <div className="filter-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="     חפש אטרקציה או יעד..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filters">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="cat-icon" aria-hidden="true">
                    <IconComponent size={18} strokeWidth={2} />
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="attractions-grid-section">
        <div className="results-count">
          <h2>נמצאו {filteredAttractions.length} אטרקציות</h2>
        </div>

        <div className="attractions-grid">
          {filteredAttractions.map((attraction) => {
            const isFav = favorites.some(fav => fav._id === attraction._id);
            return (
              <div
                key={attraction._id}
                className="attraction-card"
                onClick={() => openAttractionModal(attraction)}
              >
                <div className="attraction-image">
                  <img src={attraction.image} alt={attraction.name} />

                  {/* דירוג */}
                  <div className="attraction-badge">
                    <span className="rating-inline">
                      <Star size={14} className="inline-icon" />
                      {attraction.rating}
                    </span>
                  </div>

                  {/* לב מועדפים */}
                  <button
                    className={`attraction-favorite-heart ${isFav ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFavorite(attraction._id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={isFav ? "הסר ממועדפים" : "הוסף למועדפים"}
                  >
                    <HeartSVG filled={isFav} />
                  </button>
                </div>

                <div className="attraction-content">
                  <h3>{attraction.name}</h3>
                  <p className="location location-inline">
                    <MapPin size={15} className="inline-icon" />
                    {attraction.location}
                  </p>
                  <div className="attraction-details">
                    <span className="price">
                      {attraction.price === 0 ? "חינם" : `₪${attraction.price}`}
                    </span>
                    <span className="duration">⏱️ {attraction.duration}</span>
                  </div>
                  <button
                    className="book-btn"
                    onClick={(e) => openAttractionBooking(attraction, e)}
                  >
                    הזמן עכשיו
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Attraction Booking Modal */}
      {bookingAttraction && createPortal(
        <div className="attr-booking-overlay" onClick={() => setBookingAttraction(null)}>
          <div className="attr-booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="attr-close-btn" onClick={() => setBookingAttraction(null)}>✕</button>

            {/* Header */}
            <div className="attr-modal-header">
              <div className="attr-header-row">
                <div className="attr-destination-info">
                  <h2 className="attr-destination">{bookingAttraction.name}</h2>
                  <div className="attr-header-chips">
                    <span className="attr-header-chip">📍 {bookingAttraction.location}</span>
                    <span className="attr-header-chip">⭐ {bookingAttraction.rating}</span>
                    <span className="attr-header-chip">⏱ {bookingAttraction.duration}</span>
                  </div>
                </div>
                <div className="attr-header-price">
                  <span className="attr-header-price-label">מחיר</span>
                  <span className="attr-header-price-value">
                    {bookingAttraction.price === 0 ? "חינם" : `₪${bookingAttraction.price}`}
                  </span>
                  <span className="attr-header-price-per">למבוגר</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="attr-modal-body">

              {/* Options Column */}
              <div className="attr-options-col">
                <div className="attr-section">
                  <h3 className="attr-section-title">מבקרים</h3>

                  <div className="attr-passenger-row">
                    <div className="attr-passenger-info">
                      <span className="attr-passenger-label">מבוגרים</span>
                      <span className="attr-passenger-desc">גיל 13+ | {bookingAttraction.price === 0 ? "חינם" : `₪${bookingAttraction.price} לאדם`}</span>
                    </div>
                    <div className="attr-passenger-counter">
                      <button className="attr-counter-btn" onClick={() => setBookingQty(q => ({ ...q, adults: Math.max(1, q.adults - 1) }))} disabled={bookingQty.adults <= 1}>−</button>
                      <span className="attr-counter-val">{bookingQty.adults}</span>
                      <button className="attr-counter-btn" onClick={() => setBookingQty(q => ({ ...q, adults: Math.min(20, q.adults + 1) }))}>+</button>
                    </div>
                  </div>

                  {bookingAttraction.price > 0 && (
                    <div className="attr-passenger-row">
                      <div className="attr-passenger-info">
                        <span className="attr-passenger-label">ילדים</span>
                        <span className="attr-passenger-desc">גיל 3–12 | ₪{getChildPrice(bookingAttraction)} לילד</span>
                      </div>
                      <div className="attr-passenger-counter">
                        <button className="attr-counter-btn" onClick={() => setBookingQty(q => ({ ...q, children: Math.max(0, q.children - 1) }))} disabled={bookingQty.children <= 0}>−</button>
                        <span className="attr-counter-val">{bookingQty.children}</span>
                        <button className="attr-counter-btn" onClick={() => setBookingQty(q => ({ ...q, children: Math.min(20, q.children + 1) }))}>+</button>
                      </div>
                    </div>
                  )}

                  <div className="attr-passenger-row">
                    <div className="attr-passenger-info">
                      <span className="attr-passenger-label">תינוקות</span>
                      <span className="attr-passenger-desc">גיל 0–2 | חינם</span>
                    </div>
                    <div className="attr-passenger-counter">
                      <button className="attr-counter-btn" onClick={() => setBookingQty(q => ({ ...q, infants: Math.max(0, q.infants - 1) }))} disabled={bookingQty.infants <= 0}>−</button>
                      <span className="attr-counter-val">{bookingQty.infants}</span>
                      <button className="attr-counter-btn" onClick={() => setBookingQty(q => ({ ...q, infants: Math.min(10, q.infants + 1) }))}>+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary Column */}
              <div className="attr-summary-col">
                <div className="attr-price-card">
                  <h3 className="attr-price-title">סיכום מחיר</h3>
                  <div className="attr-price-rows">
                    <div className="attr-price-row">
                      <span>{bookingQty.adults} מבוגרים × ₪{bookingAttraction.price}</span>
                      <span>₪{bookingAttraction.price * bookingQty.adults}</span>
                    </div>
                    {bookingQty.children > 0 && (
                      <div className="attr-price-row">
                        <span>{bookingQty.children} ילדים × ₪{getChildPrice(bookingAttraction)}</span>
                        <span>₪{getChildPrice(bookingAttraction) * bookingQty.children}</span>
                      </div>
                    )}
                    {bookingQty.infants > 0 && (
                      <div className="attr-price-row">
                        <span>{bookingQty.infants} תינוקות</span>
                        <span className="attr-free">חינם</span>
                      </div>
                    )}
                  </div>
                  <div className="attr-price-divider"></div>
                  <div className="attr-price-total">
                    <span>סה״כ לתשלום</span>
                    <span className="attr-price-total-amount">
                      {calcAttractionTotal(bookingAttraction, bookingQty) === 0
                        ? "חינם"
                        : `₪${calcAttractionTotal(bookingAttraction, bookingQty)}`}
                    </span>
                  </div>
                  <button className="attr-confirm-btn" onClick={confirmAttractionBooking}>
                    הוסף לסל
                  </button>
                  <p className="attr-price-note">לאחר ההוספה תוכלו לעיין ולערוך בעמוד הסל</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal - השלמתי את החלק החסר */}
      {selectedAttraction && createPortal(
        <div className="attr-booking-overlay" onClick={closeAttractionModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={closeAttractionModal}>✕</button>

            <div className="modal-image">
              <img src={selectedAttraction.image} alt={selectedAttraction.name} />
            </div>

            <div className="modal-info">
              <h2>{selectedAttraction.name}</h2>
              <p className="modal-location location-inline">
                <MapPin size={16} className="inline-icon" />
                {selectedAttraction.location}
              </p>
              <div className="modal-rating">
                <span className="rating-inline">
                  <Star size={14} className="inline-icon" />
                  {selectedAttraction.rating}
                </span>
              </div>

              <p className="modal-description">{selectedAttraction.description}</p>

              <div className="modal-highlights">
                <h4>מה כלול:</h4>
                <ul>
                  {/* השתמשתי בסימן שאלה למקרה שלאטרקציה מסוימת אין מפרט */}
                  {selectedAttraction.highlights?.slice(0, 3).map((h, i) => (
                    <li key={i}>✓ {h}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-footer">
                <div className="modal-price">
                  <span className="price-label">מחיר: </span>
                  <span className="price-value">
                    {selectedAttraction.price === 0 ? "חינם" : `₪${selectedAttraction.price} למבוגר`}
                  </span>
                </div>
                <button
                  className="book-btn"
                  onClick={(e) => openAttractionBooking(selectedAttraction, e)}
                >
                  הזמן עכשיו
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Attractions;