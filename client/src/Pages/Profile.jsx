import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  ShoppingBag,
  CalendarDays,
  MapPin,
  ChevronDown,
  ChevronUp,
  Plane,
  Ticket,
} from "lucide-react";
import Header from "../Header&Footer/Header";
import Footer from "../Header&Footer/Footer";
import "./Profile.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const paymentLabel = (method) => {
  if (method === "credit") return "כרטיס אשראי";
  if (method === "paypal") return "PayPal";
  if (method === "bit") return "Bit";
  return method || "—";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) return;

    // Load user info from localStorage (already present after login)
    setUser({
      fullName: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
    });

    // Fetch orders from backend
    const token = localStorage.getItem("authToken");
    fetch(`${API_BASE}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-empty-state">
          <div className="empty-icon-wrap">
            <User className="empty-icon-svg" />
          </div>
          <h2>עליך להתחבר כדי לצפות בפרופיל</h2>
          <p>התחבר כדי לראות את הפרטים שלך והזמנות קודמות</p>
          <button className="profile-btn-primary" onClick={() => navigate("/login")}>
            התחבר עכשיו
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />

      {/* ── Hero ── */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar">
            <User className="profile-avatar-icon" />
          </div>
          <h1>{user?.fullName || "המשתמש שלי"}</h1>
          <p>{user?.email}</p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="profile-content">
        <div className="profile-container">
          <div className="profile-grid">

            {/* ── עמודה 1: פרטי משתמש ── */}
            <aside className="profile-sidebar">
              <div className="profile-card profile-info-card">
                <h2 className="profile-card-title">
                  <User size={18} />
                  פרטי החשבון
                </h2>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <User size={15} /> שם מלא
                  </span>
                  <span className="profile-info-value">{user?.fullName || "—"}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Mail size={15} /> אימייל
                  </span>
                  <span className="profile-info-value">{user?.email || "—"}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Phone size={15} /> טלפון
                  </span>
                  <span className="profile-info-value">
                    {orders[0]?.customerInfo?.phone || "לא עודכן"}
                  </span>
                </div>
              </div>

              <div className="profile-card profile-stats-card">
                <h2 className="profile-card-title">
                  <ShoppingBag size={18} />
                  סטטיסטיקה
                </h2>
                <div className="profile-stat">
                  <span className="stat-number">{orders.length}</span>
                  <span className="stat-label">הזמנות</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">
                    ₪{orders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}
                  </span>
                  <span className="stat-label">סה"כ הוצאות</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">
                    {orders.reduce((s, o) => s + (o.items?.length || 0), 0)}
                  </span>
                  <span className="stat-label">פריטים שנרכשו</span>
                </div>
              </div>
            </aside>

            {/* ── עמודה 2: היסטוריית הזמנות ── */}
            <main className="profile-orders">
              <h2 className="profile-section-title">
                <ShoppingBag size={20} />
                היסטוריית הזמנות
              </h2>

              {loadingOrders && (
                <div className="profile-loading">
                  <div className="profile-spinner" />
                  <span>טוען הזמנות...</span>
                </div>
              )}

              {!loadingOrders && orders.length === 0 && (
                <div className="profile-orders-empty">
                  <ShoppingBag size={56} className="orders-empty-icon" />
                  <h3>עדיין אין הזמנות</h3>
                  <p>לאחר ביצוע הזמנה ראשונה היא תופיע כאן</p>
                  <button
                    className="profile-btn-primary"
                    onClick={() => navigate("/deals")}
                  >
                    לחפש דילים
                  </button>
                </div>
              )}

              <div className="orders-list">
                {orders.map((order) => {
                  const isOpen = expandedOrder === order._id;
                  return (
                    <div key={order._id} className={`order-card ${isOpen ? "open" : ""}`}>
                      {/* ── כותרת הזמנה (תמיד גלויה) ── */}
                      <button
                        className="order-card-header"
                        onClick={() => setExpandedOrder(isOpen ? null : order._id)}
                      >
                        <div className="order-header-right">
                          <span className="order-id-badge">#{order.orderId}</span>
                          <span className="order-date">
                            <CalendarDays size={14} />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="order-header-left">
                          <span className="order-total">₪{(order.totalAmount || 0).toLocaleString()}</span>
                          <span className="order-status-badge">הושלמה</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {/* ── פרטי הזמנה (מורחב) ── */}
                      {isOpen && (
                        <div className="order-card-body">
                          {/* פריטים */}
                          <div className="order-section">
                            <h4 className="order-section-label">פריטי ההזמנה</h4>
                            <div className="order-items-list">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="order-item">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="order-item-img"
                                    />
                                  )}
                                  <div className="order-item-info">
                                    <div className="order-item-type-badge">
                                      {item.type === "deal" ? (
                                        <><Plane size={12} /> דיל</>
                                      ) : (
                                        <><Ticket size={12} /> אטרקציה</>
                                      )}
                                    </div>
                                    <span className="order-item-name">
                                      {item.name || item.destination}
                                    </span>
                                    {(item.destination || item.location) && (
                                      <span className="order-item-location">
                                        <MapPin size={12} />
                                        {item.destination || item.location}
                                      </span>
                                    )}
                                    {item.dates && (
                                      <span className="order-item-dates">
                                        <CalendarDays size={12} /> {item.dates}
                                      </span>
                                    )}
                                  </div>
                                  <span className="order-item-price">
                                    ₪{(item.totalPrice || item.price || 0).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* פרטי הזמנה */}
                          <div className="order-meta-grid">
                            <div className="order-meta-block">
                              <h4 className="order-section-label">פרטי מזמין</h4>
                              <p>{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                              <p>{order.customerInfo?.email}</p>
                              <p>{order.customerInfo?.phone}</p>
                              <p>{order.customerInfo?.country}</p>
                            </div>
                            <div className="order-meta-block">
                              <h4 className="order-section-label">תשלום</h4>
                              <p>{paymentLabel(order.paymentMethod)}</p>
                              <div className="order-total-row">
                                <span>סה"כ שולם</span>
                                <strong>₪{(order.totalAmount || 0).toLocaleString()}</strong>
                              </div>
                            </div>
                            {order.passengers?.length > 0 && (
                              <div className="order-meta-block">
                                <h4 className="order-section-label">נוסעים</h4>
                                {order.passengers.map((p, i) => (
                                  <p key={i}>{p.firstName} {p.lastName}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </main>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
