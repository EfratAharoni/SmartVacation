import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Globe, Landmark, Images, Trees, Building2, Gift, Star, MapPin } from "lucide-react";
import "./Attractions.css";
import { API_BASE_URL } from "../utils/api";
import useLocalize from "../utils/useLocalize";
import Reviews from "../components/Reviews";
import AttractionBookingModal from "../components/AttractionBookingModal";
import { toast } from "../components/Toast";
import { useUserLists } from "../context/UserListsContext";
import { usePreferences } from "../context/PreferencesContext";

const Attractions = () => {
  const navigate = useNavigate();
  const { t, tc } = useLocalize();
  const { price } = usePreferences();
  const { isLoggedIn, isFavorite, toggleFavorite: toggleFav, addToCart } = useUserLists();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [attractions, setAttractions] = useState([]);
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [bookingAttraction, setBookingAttraction] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", icon: Globe },
    { id: "landmarks", icon: Landmark },
    { id: "museums", icon: Images },
    { id: "nature", icon: Trees },
    { id: "temples", icon: Building2 },
    { id: "free", icon: Gift },
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
        console.error("Failed to load attractions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

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
      // search both the Hebrew and English names/locations
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((attr) =>
        [attr.name, attr.location, attr.en?.name, attr.en?.location]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term))
      );
    }
    setFilteredAttractions(filtered);
  }, [selectedCategory, searchTerm, attractions]);

  const toggleFavorite = (attractionId) => {
    const attraction = attractions.find((a) => a._id === attractionId);
    if (!attraction) return;
    if (toggleFav({ ...attraction, type: "attraction" }) === "login") {
      toast.info(t("common.loginToFav"));
      navigate("/login");
    }
  };

  const openAttractionBooking = (attraction, e) => {
    e?.stopPropagation();
    if (!isLoggedIn) {
      toast.info(t("common.loginToBook"));
      navigate("/login");
      return;
    }
    setBookingAttraction(attraction);
    setSelectedAttraction(null);
  };

  const confirmAttractionBooking = (bookingQty, totalPrice) => {
    const name = tc(bookingAttraction, "name");
    const result = addToCart({ ...bookingAttraction, type: "attraction", bookingQty, totalPrice });
    if (result === "exists") {
      toast.info(t("common.alreadyInCart", { name }));
      return;
    }
    setBookingAttraction(null);
    toast.success(t("common.addedToCart", { name }));
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

  if (loading) return <div className="loader" style={{textAlign: "center", padding: "50px", fontSize: "20px"}}>{t("attractions.loading")}</div>;

  return (
    <div className="attractions-page">
      {/* Hero */}
      <section className="attractions-hero">
        <div className="hero-content">
          <h1 className="floating">{t("attractions.heroTitle")}</h1>
          <p>{t("attractions.heroSubtitle")}</p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="filter-section">
        <div className="filter-container">
          <div className={`search-box ${searchTerm ? 'has-value' : ''}`}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={`     ${t("attractions.searchPlaceholder")}`}
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
                  <span>{t(`attractions.cat.${cat.id}`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="attractions-grid-section">
        <div className="results-count">
          <h2>{t("attractions.found", { count: filteredAttractions.length })}</h2>
        </div>

        <div className="attractions-grid">
          {filteredAttractions.map((attraction) => {
            const isFav = isFavorite({ ...attraction, type: "attraction" });
            return (
              <div
                key={attraction._id}
                className="attraction-card"
                onClick={() => openAttractionModal(attraction)}
              >
                <div className="attraction-image">
                  <img src={attraction.image} alt={tc(attraction, "name")} />

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
                    aria-label={isFav ? t("common.removeFav") : t("common.addFav")}
                  >
                    <HeartSVG filled={isFav} />
                  </button>
                </div>

                <div className="attraction-content">
                  <h3>{tc(attraction, "name")}</h3>
                  <p className="location location-inline">
                    <MapPin size={15} className="inline-icon" />
                    {tc(attraction, "location")}
                  </p>
                  <div className="attraction-details">
                    <span className="price">
                      {attraction.price === 0 ? t("common.free") : price(attraction.price)}
                    </span>
                    <span className="duration">⏱️ {tc(attraction, "duration")}</span>
                  </div>
                  <button
                    className="book-btn"
                    onClick={(e) => openAttractionBooking(attraction, e)}
                  >
                    {t("common.bookNow")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Attraction Booking Modal (shared with the cart) */}
      {bookingAttraction && (
        <AttractionBookingModal
          attraction={bookingAttraction}
          onClose={() => setBookingAttraction(null)}
          onConfirm={confirmAttractionBooking}
          confirmLabel={t("common.addToCart")}
          note={t("booking.addNote")}
        />
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
              <img src={selectedAttraction.image} alt={tc(selectedAttraction, "name")} />
            </div>

            <div className="modal-info">
              <h2>{tc(selectedAttraction, "name")}</h2>
              <p className="modal-location location-inline">
                <MapPin size={16} className="inline-icon" />
                {tc(selectedAttraction, "location")}
              </p>
              <div className="modal-rating">
                <span className="rating-inline">
                  <Star size={14} className="inline-icon" />
                  {selectedAttraction.rating}
                </span>
              </div>

              <p className="modal-description">{tc(selectedAttraction, "description")}</p>

              <div className="modal-highlights">
                <h4>{t("attractions.whatsIncluded")}</h4>
                <ul>
                  {/* השתמשתי בסימן שאלה למקרה שלאטרקציה מסוימת אין מפרט */}
                  {tc(selectedAttraction, "highlights")?.slice(0, 3).map((h, i) => (
                    <li key={i}>✓ {h}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-footer">
                <div className="modal-price">
                  <span className="price-label">{t("attractions.priceLabel")}</span>
                  <span className="price-value">
                    {selectedAttraction.price === 0 ? t("common.free") : t("attractions.perAdultPrice", { price: price(selectedAttraction.price) })}
                  </span>
                </div>
                <button
                  className="modal-book-btn"
                  onClick={(e) => openAttractionBooking(selectedAttraction, e)}
                >
                  {t("common.bookNow")}
                </button>
              </div>

              <Reviews itemType="attraction" itemKey={selectedAttraction._id} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Attractions;