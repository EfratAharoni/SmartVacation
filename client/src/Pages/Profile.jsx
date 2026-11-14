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
  KeyRound,
  Languages,
} from "lucide-react";
import "./Profile.css";
import { apiJson } from "../utils/api";
import useLocalize from "../utils/useLocalize";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "../components/Toast";

export default function Profile() {
  const navigate = useNavigate();
  const { t, tc, formatDate, formatNumber } = useLocalize();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "" });
  const [pwdStatus, setPwdStatus] = useState({ type: "", text: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const paymentLabel = (method) => {
    if (method === "credit") return t("common.creditCard");
    if (method === "paypal") return "PayPal";
    if (method === "bit") return "Bit";
    return method || "—";
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    // Show what we have locally right away, then refresh from the server
    setUser({
      fullName: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
    });
    apiJson("/users/me")
      .then(({ user: me }) => me && setUser(me))
      .catch(() => {});

    apiJson("/orders/my")
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [isLoggedIn]);

  const cancelOrder = async (order) => {
    setOrderToCancel(null);
    setCancellingId(order._id);
    try {
      const { order: updated } = await apiJson(`/orders/${order._id}/cancel`, { method: "PUT" });
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      toast.success(t("profile.cancelledToast"));
    } catch (err) {
      toast.error(err.message || t("common.networkError"));
    } finally {
      setCancellingId(null);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdStatus({ type: "", text: "" });
    try {
      const { message } = await apiJson("/users/change-password", { method: "PUT", body: pwd });
      setPwdStatus({ type: "success", text: message });
      setPwd({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setPwdStatus({ type: "error", text: err.message || t("common.networkError") });
    } finally {
      setPwdSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <div className="profile-empty-state">
          <div className="empty-icon-wrap">
            <User className="empty-icon-svg" />
          </div>
          <h2>{t("profile.loginTitle")}</h2>
          <p>{t("profile.loginText")}</p>
          <button className="profile-btn-primary" onClick={() => navigate("/login")}>
            {t("common.loginNow")}
          </button>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "cancelled");

  return (
    <div className="profile-page">
      {/* ── Hero ── */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar">
            <User className="profile-avatar-icon" />
          </div>
          <h1>{user?.fullName || t("profile.myUser")}</h1>
          <p>{user?.email}</p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="profile-content">
        <div className="profile-container">
          <div className="profile-grid">
            {/* ── Column 1: account ── */}
            <aside className="profile-sidebar">
              <div className="profile-card profile-info-card">
                <h2 className="profile-card-title">
                  <User size={18} />
                  {t("profile.accountDetails")}
                </h2>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <User size={15} /> {t("common.fullName")}
                  </span>
                  <span className="profile-info-value">{user?.fullName || "—"}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Mail size={15} /> {t("common.email")}
                  </span>
                  <span className="profile-info-value">{user?.email || "—"}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Phone size={15} /> {t("common.phone")}
                  </span>
                  <span className="profile-info-value">{user?.phone || t("common.notUpdated")}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Languages size={15} /> {t("profile.preferredLanguage")}
                  </span>
                  <span className="profile-info-value">
                    <LanguageSwitcher compact />
                  </span>
                </div>
              </div>

              <div className="profile-card profile-stats-card">
                <h2 className="profile-card-title">
                  <ShoppingBag size={18} />
                  {t("profile.stats")}
                </h2>
                <div className="profile-stat">
                  <span className="stat-number">{activeOrders.length}</span>
                  <span className="stat-label">{t("profile.orders")}</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">
                    ₪{formatNumber(activeOrders.reduce((s, o) => s + (o.totalAmount || 0), 0))}
                  </span>
                  <span className="stat-label">{t("profile.totalSpent")}</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">
                    {activeOrders.reduce((s, o) => s + (o.items?.length || 0), 0)}
                  </span>
                  <span className="stat-label">{t("profile.itemsPurchased")}</span>
                </div>
              </div>

              <div className="profile-card profile-password-card">
                <h2 className="profile-card-title">
                  <KeyRound size={18} />
                  {t("profile.changePassword")}
                </h2>
                <form className="profile-password-form" onSubmit={changePassword}>
                  <label>
                    <span>{t("profile.oldPassword")}</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={pwd.oldPassword}
                      onChange={(e) => setPwd((p) => ({ ...p, oldPassword: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    <span>{t("profile.newPassword")}</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={pwd.newPassword}
                      onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                      required
                    />
                  </label>
                  <button type="submit" className="profile-btn-primary" disabled={pwdSaving}>
                    {t("profile.updatePassword")}
                  </button>
                  {pwdStatus.text && (
                    <p className={`profile-pwd-status ${pwdStatus.type}`} role="status">
                      {pwdStatus.text}
                    </p>
                  )}
                </form>
              </div>
            </aside>

            {/* ── Column 2: order history ── */}
            <main className="profile-orders">
              <h2 className="profile-section-title">
                <ShoppingBag size={20} />
                {t("profile.orderHistory")}
              </h2>

              {loadingOrders && (
                <div className="profile-loading">
                  <div className="profile-spinner" />
                  <span>{t("profile.loadingOrders")}</span>
                </div>
              )}

              {!loadingOrders && orders.length === 0 && (
                <div className="profile-orders-empty">
                  <ShoppingBag size={56} className="orders-empty-icon" />
                  <h3>{t("profile.noOrders")}</h3>
                  <p>{t("profile.noOrdersText")}</p>
                  <button className="profile-btn-primary" onClick={() => navigate("/deals")}>
                    {t("profile.findDeals")}
                  </button>
                </div>
              )}

              <div className="orders-list">
                {orders.map((order) => {
                  const isOpen = expandedOrder === order._id;
                  const isCancelled = order.status === "cancelled";
                  return (
                    <div key={order._id} className={`order-card ${isOpen ? "open" : ""} ${isCancelled ? "cancelled" : ""}`}>
                      {/* ── Header (always visible) ── */}
                      <button
                        className="order-card-header"
                        onClick={() => setExpandedOrder(isOpen ? null : order._id)}
                        aria-expanded={isOpen}
                      >
                        <div className="order-header-right">
                          <span className="order-id-badge">#{String(order.orderId).slice(0, 8).toUpperCase()}</span>
                          <span className="order-date">
                            <CalendarDays size={14} />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="order-header-left">
                          <span className="order-total">₪{formatNumber(order.totalAmount)}</span>
                          <span className={`order-status-badge ${isCancelled ? "is-cancelled" : ""}`}>
                            {isCancelled ? t("profile.cancelled") : t("profile.completed")}
                          </span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {/* ── Details (expanded) ── */}
                      {isOpen && (
                        <div className="order-card-body">
                          <div className="order-section">
                            <h4 className="order-section-label">{t("profile.orderItems")}</h4>
                            <div className="order-items-list">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="order-item">
                                  {item.image && (
                                    <img src={item.image} alt={tc(item, "name")} className="order-item-img" />
                                  )}
                                  <div className="order-item-info">
                                    <div className="order-item-type-badge">
                                      {item.type === "deal" ? (
                                        <><Plane size={12} /> {t("common.deal")}</>
                                      ) : (
                                        <><Ticket size={12} /> {t("common.attraction")}</>
                                      )}
                                    </div>
                                    <span className="order-item-name">
                                      {tc(item, "name") || tc(item, "destination")}
                                    </span>
                                    {(item.destination || item.location) && (
                                      <span className="order-item-location">
                                        <MapPin size={12} />
                                        {tc(item, "destination") || tc(item, "location")}
                                      </span>
                                    )}
                                    {item.dates && (
                                      <span className="order-item-dates">
                                        <CalendarDays size={12} /> {tc(item, "dates")}
                                      </span>
                                    )}
                                  </div>
                                  <span className="order-item-price">
                                    ₪{formatNumber(item.totalPrice || item.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="order-meta-grid">
                            <div className="order-meta-block">
                              <h4 className="order-section-label">{t("profile.ordererDetails")}</h4>
                              <p>{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                              <p>{order.customerInfo?.email}</p>
                              <p>{order.customerInfo?.phone}</p>
                              <p>{order.customerInfo?.country}</p>
                            </div>
                            <div className="order-meta-block">
                              <h4 className="order-section-label">{t("profile.payment")}</h4>
                              <p>{paymentLabel(order.paymentMethod)}</p>
                              <div className="order-total-row">
                                <span>{t("profile.paid")}</span>
                                <strong>₪{formatNumber(order.totalAmount)}</strong>
                              </div>
                            </div>
                            {order.passengers?.length > 0 && (
                              <div className="order-meta-block">
                                <h4 className="order-section-label">{t("profile.passengers")}</h4>
                                {order.passengers.map((p, i) => (
                                  <p key={i}>{p.firstName} {p.lastName}</p>
                                ))}
                              </div>
                            )}
                          </div>

                          {!isCancelled && (
                            <div className="order-actions">
                              <button
                                type="button"
                                className="order-cancel-btn"
                                onClick={() => setOrderToCancel(order)}
                                disabled={cancellingId === order._id}
                              >
                                {t("profile.cancelOrder")}
                              </button>
                            </div>
                          )}
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

      {orderToCancel && (
        <ConfirmDialog
          message={t("profile.confirmCancel")}
          confirmLabel={t("profile.cancelOrder")}
          cancelLabel={t("common.back")}
          onCancel={() => setOrderToCancel(null)}
          onConfirm={() => cancelOrder(orderToCancel)}
        />
      )}
    </div>
  );
}
