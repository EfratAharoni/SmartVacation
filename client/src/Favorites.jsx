import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./Favorites.css";

const Favorites = () => {
  const navigate = useNavigate();
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filter, setFilter] = useState("all"); // all, attractions, deals

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      loadFavorites();
    }
  }, []);

  const loadFavorites = () => {
    const userName = localStorage.getItem("userName");
    const userKey = userName.replace(/\s/g, "_");

    // Load all favorites (both attractions and deals) - both stored in same key with type field
    const allFavs = JSON.parse(
      localStorage.getItem(`favorites_${userKey}`) || "[]",
    );
    // Also load old format if it exists
    const oldDealFavs = JSON.parse(
      localStorage.getItem(`favorites_deals_${userKey}`) || "[]",
    );

    setFavoriteItems([...allFavs, ...oldDealFavs]);
  };

  const removeFromFavorites = (itemId, itemType) => {
    const userName = localStorage.getItem("userName");
    const userKey = userName.replace(/\s/g, "_");

    const updated = favoriteItems.filter(
      (item) => !(item.id === itemId && item.type === itemType),
    );

    setFavoriteItems(updated);

    // Save back to same key - newly formatted items
    const newFavs = updated.filter((i) => i.type);
    localStorage.setItem(`favorites_${userKey}`, JSON.stringify(newFavs));

    window.dispatchEvent(new Event("userDataUpdated"));
  };

  const addToCart = (item) => {
    const userName = localStorage.getItem("userName");
    const userKey = userName.replace(/\s/g, "_");

    const cart = JSON.parse(localStorage.getItem(`cart_${userKey}`) || "[]");
    const alreadyIn = cart.some(
      (cartItem) => cartItem.id === item.id && cartItem.type === item.type,
    );

    if (alreadyIn) {
      alert(`${item.name} כבר נמצא בעגלה שלך!`);
      return;
    }

    const updated = [...cart, { ...item, addedAt: new Date().toISOString() }];
    localStorage.setItem(`cart_${userKey}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("userDataUpdated"));
    alert(`${item.name} נוסף לעגלה! 🛒`);
  };

  const clearAllFavorites = () => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את כל המועדפים?")) {
      const userName = localStorage.getItem("userName");
      const userKey = userName.replace(/\s/g, "_");

      setFavoriteItems([]);
      localStorage.setItem(`favorites_${userKey}`, JSON.stringify([]));
      window.dispatchEvent(new Event("userDataUpdated"));
    }
  };

  const getFilteredItems = () => {
    if (filter === "all") return favoriteItems;
    return favoriteItems.filter((item) => item.type === filter);
  };

  const filteredItems = getFilteredItems();

  if (!isLoggedIn) {
    return (
      <div className="favorites-page">
        <Header />
        <div className="favorites-empty-state">
          <div className="empty-icon">❤️</div>
          <h2>עליך להתחבר כדי לצפות במועדפים</h2>
          <p>התחבר כדי לראות את הדילים והאטרקציות שאהבת</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            התחבר עכשיו
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="favorites-page">
        <Header />
        <div className="favorites-empty-state">
          <div className="empty-icon">❤️</div>
          <h2>עדיין אין לך מועדפים</h2>
          <p>התחל לחפש דילים ואטרקציות ושמור את האהובים עליך</p>
          <div className="empty-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/deals")}
            >
              חפש דילים
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/attractions")}
            >
              חפש אטרקציות
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <Header />

      <section className="favorites-hero">
        <div className="hero-content">
          <h1>❤️ המועדפים שלי</h1>
          <p>{favoriteItems.length} פריטים שאהבת</p>
        </div>
      </section>

      <section className="favorites-content">
        <div className="favorites-container">
          <div className="favorites-header">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                הכל ({favoriteItems.length})
              </button>
              <button
                className={`filter-tab ${filter === "attraction" ? "active" : ""}`}
                onClick={() => setFilter("attraction")}
              >
                🎯 אטרקציות (
                {favoriteItems.filter((i) => i.type === "attraction").length})
              </button>
              <button
                className={`filter-tab ${filter === "deal" ? "active" : ""}`}
                onClick={() => setFilter("deal")}
              >
                🔥 דילים (
                {favoriteItems.filter((i) => i.type === "deal").length})
              </button>
            </div>

            <button className="clear-all-btn" onClick={clearAllFavorites}>
              מחק הכל
            </button>
          </div>

          <div className="favorites-grid">
            {filteredItems.map((item, index) => (
              <div
                key={`${item.id}-${item.type}-${index}`}
                className="favorite-card"
              >
                <button
                  className="remove-favorite-btn"
                  onClick={() => removeFromFavorites(item.id, item.type)}
                  title="הסר מהמועדפים"
                >
                  ×
                </button>

                <div className="favorite-image">
                  <img src={item.image} alt={item.name} />
                  <span className="type-badge">
                    {item.type === "attraction" ? "🎯 אטרקציה" : "🔥 דיל"}
                  </span>
                </div>

                <div className="favorite-content">
                  <h3>{item.name}</h3>
                  <p className="favorite-location">📍 {item.location}</p>

                  {item.rating && (
                    <div className="favorite-rating">
                      <span>⭐ {item.rating}</span>
                    </div>
                  )}

                  {item.type === "attraction" && item.duration && (
                    <p className="favorite-duration">⏱️ {item.duration}</p>
                  )}

                  {item.type === "deal" && item.dates && (
                    <p className="favorite-dates">📅 {item.dates}</p>
                  )}

                  <div className="favorite-footer">
                    <div className="favorite-price">₪{item.price}</div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      🛒 הוסף לעגלה
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Favorites;
