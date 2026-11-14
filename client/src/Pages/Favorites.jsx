import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Clock3,
  CalendarDays,
  Star,
  ShoppingCart,
  Flame,
  Trash2,
} from "lucide-react";
import "./Favorites.css";
import useLocalize from "../utils/useLocalize";
import { useUserLists, itemKey } from "../context/UserListsContext";
import { usePreferences } from "../context/PreferencesContext";
import { toast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const Favorites = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all, attraction, deal
  const [confirmClear, setConfirmClear] = useState(false);
  const { t, tc } = useLocalize();
  const { price } = usePreferences();
  const { isLoggedIn, favorites: favoriteItems, removeFavorite, clearFavorites, addToCart: addItemToCart } = useUserLists();

  const getItemDisplayName = (item) =>
    tc(item, "name") || tc(item, "destination") || item?.title || tc(item, "location") || t("common.unnamed");

  const getItemDisplayLocation = (item) => tc(item, "location") || tc(item, "destination") || "";

  const addToCart = (item) => {
    const name = getItemDisplayName(item);
    const result = addItemToCart(item);
    if (result === "exists") toast.info(t("common.alreadyInCart", { name }));
    else if (result === "added") toast.success(t("common.addedToCart", { name }));
  };

  const getFilteredItems = () => {
    if (filter === "all") return favoriteItems;
    return favoriteItems.filter((item) => item.type === filter);
  };

  const filteredItems = getFilteredItems();

  if (!isLoggedIn) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty-state">
          <div className="empty-icon">
            <Heart className="empty-icon-svg" />
          </div>
          <h2>{t("favorites.loginTitle")}</h2>
          <p>{t("favorites.loginText")}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            {t("common.loginNow")}
          </button>
        </div>
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty-state">
          <div className="empty-icon">
            <Heart className="empty-icon-svg" />
          </div>
          <h2>{t("favorites.emptyTitle")}</h2>
          <p>{t("favorites.emptyText")}</p>
          <div className="empty-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/deals")}
            >
              {t("favorites.searchDeals")}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/attractions")}
            >
              {t("favorites.searchAttractions")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">

      <section className="favorites-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <Heart className="title-icon" />
            {t("favorites.title")}
          </h1>
          <p>{t("favorites.itemsYouLiked", { count: favoriteItems.length })}</p>
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
                {t("favorites.all", { count: favoriteItems.length })}
              </button>
              <button
                className={`filter-tab ${filter === "attraction" ? "active" : ""}`}
                onClick={() => setFilter("attraction")}
              >
                <MapPin className="tab-icon attraction-icon" /> {t("favorites.attractions", { count: favoriteItems.filter((i) => i.type === "attraction").length })}
              </button>
              <button
                className={`filter-tab ${filter === "deal" ? "active" : ""}`}
                onClick={() => setFilter("deal")}
              >
                <Flame className="tab-icon deal-icon" /> {t("favorites.deals", { count: favoriteItems.filter((i) => i.type === "deal").length })}
              </button>
            </div>

            <button className="clear-all-btn" onClick={() => setConfirmClear(true)}>
              {t("favorites.clearAll")}
            </button>
          </div>

          {filteredItems.length === 0 && (
            <div className="filter-empty-state">
              <p>{t("favorites.noItemsInCategory")}</p>
            </div>
          )}

          <div className="favorites-grid">
            {filteredItems.map((item, index) => (
              <div
                key={`${itemKey(item)}-${item.type}-${index}`}
                className="favorite-card"
              >
                <button
                  className="remove-favorite-btn"
                  onClick={() => removeFavorite(item)}
                  title={t("favorites.removeFav")}
                  aria-label={t("favorites.removeFav")}
                >
                  <Trash2 className="remove-icon" />
                </button>

                <div className="favorite-image">
                  <img src={item.image} alt={getItemDisplayName(item)} />
                  <span className="type-badge">
                    {item.type === "attraction" ? <MapPin className="type-badge-icon attraction-icon" /> : <Flame className="type-badge-icon deal-icon" />}
                    {item.type === "attraction" ? t("common.attraction") : t("common.deal")}
                  </span>
                </div>

                <div className="favorite-content">
                  <h3>{getItemDisplayName(item)}</h3>
                  {getItemDisplayLocation(item) && (
                    <p className="favorite-location"><MapPin className="meta-icon" />{getItemDisplayLocation(item)}</p>
                  )}

                  {item.rating && (
                    <div className="favorite-rating">
                      <span><Star className="meta-icon star-icon" />{item.rating}</span>
                    </div>
                  )}

                  {item.type === "attraction" && item.duration && (
                    <p className="favorite-duration"><Clock3 className="meta-icon" />{tc(item, "duration")}</p>
                  )}

                  {item.type === "deal" && item.dates && (
                    <p className="favorite-dates"><CalendarDays className="meta-icon" />{[].concat(tc(item, "dates")).join(" · ")}</p>
                  )}

                  <div className="favorite-footer">
                    <div className="favorite-price">{price(item.price)}</div>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="btn-icon" /> {t("favorites.addToCart")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {confirmClear && (
        <ConfirmDialog
          message={t("favorites.confirmClear")}
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            clearFavorites();
            setConfirmClear(false);
          }}
        />
      )}
    </div>
  );
};

export default Favorites;
