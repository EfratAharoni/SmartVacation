import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Pencil, Plus, Trash2, CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { apiJson } from "../utils/api";
import useLocalize from "../utils/useLocalize";
import AdminItemForm from "./AdminItemForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "../components/Toast";
import "./Admin.css";

const ENDPOINTS = {
  deals: { list: "/deals", create: "/deals/add", item: (id) => `/deals/${id}` },
  attractions: { list: "/attractions", create: "/attractions/add", item: (id) => `/attractions/${id}` },
};

export default function Admin() {
  const { t, tc, isEn, formatDate, formatNumber } = useLocalize();
  const [tab, setTab] = useState("deals");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const isAdmin =
    localStorage.getItem("isLoggedIn") === "true" && localStorage.getItem("userRole") === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let data;
      if (tab === "deals" || tab === "attractions") data = await apiJson(ENDPOINTS[tab].list);
      else if (tab === "orders") data = (await apiJson("/orders")).orders;
      else if (tab === "users") data = await apiJson("/users");
      else if (tab === "reviews") data = (await apiJson("/reviews")).reviews;
      else data = (await apiJson("/contact")).messages;
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const saveItem = async (data) => {
    const ep = ENDPOINTS[tab];
    if (editing._id) await apiJson(ep.item(editing._id), { method: "PUT", body: data });
    else await apiJson(ep.create, { method: "POST", body: data });
    setEditing(null);
    toast.success(t("admin.saved"));
    load();
  };

  const deleteRow = async (row) => {
    setToDelete(null);
    try {
      if (tab === "users") await apiJson(`/users/remove/${row._id}`, { method: "DELETE" });
      else if (tab === "reviews") await apiJson(`/reviews/${row._id}`, { method: "DELETE" });
      else await apiJson(ENDPOINTS[tab].item(row._id), { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r._id !== row._id));
      toast.success(t("admin.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleHandled = async (row) => {
    try {
      const { message } = await apiJson(`/contact/${row._id}/handled`, { method: "PUT" });
      setRows((prev) => prev.map((r) => (r._id === row._id ? message : r)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  if (!isAdmin) {
    return localStorage.getItem("isLoggedIn") === "true" ? (
      <div className="admin-page">
        <div className="admin-denied">
          <ShieldCheck size={48} aria-hidden="true" />
          <h2>{t("admin.noAccess")}</h2>
        </div>
      </div>
    ) : (
      <Navigate to="/login" replace />
    );
  }

  const renderTable = () => {
    if (loading) return <p className="admin-muted">{t("common.loading")}</p>;
    if (error) return <p className="admin-error">{error}</p>;
    if (filtered.length === 0) return <p className="admin-muted">{t("admin.empty")}</p>;

    if (tab === "deals" || tab === "attractions") {
      const isDeals = tab === "deals";
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.image")}</th>
              <th>{isDeals ? t("admin.destination") : t("admin.name")}</th>
              {!isDeals && <th>{t("admin.location")}</th>}
              <th>{t("admin.category")}</th>
              <th>{t("admin.price")}</th>
              <th>{t("admin.rating")}</th>
              {isDeals && <th>{t("admin.kosher")}</th>}
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id}>
                <td>{r.image && <img src={r.image} alt="" className="admin-thumb" />}</td>
                <td>
                  <strong>{isDeals ? tc(r, "destination") : tc(r, "name")}</strong>
                  {isDeals && <div className="admin-sub">{tc(r, "hotelName") || tc(r, "hotel")}</div>}
                </td>
                {!isDeals && <td>{tc(r, "location")}</td>}
                <td>{r.category}</td>
                <td>₪{formatNumber(r.price)}</td>
                <td>{r.rating}</td>
                {isDeals && <td>{r.isKosherFriendly ? "✓" : ""}</td>}
                <td className="admin-actions">
                  <button type="button" className="admin-icon-btn" onClick={() => setEditing(r)} aria-label={t("common.edit")}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="admin-icon-btn danger" onClick={() => setToDelete(r)} aria-label={t("common.delete")}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (tab === "orders") {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.orderId")}</th>
              <th>{t("admin.date")}</th>
              <th>{t("admin.customer")}</th>
              <th>{t("admin.items")}</th>
              <th>{t("admin.total")}</th>
              <th>{t("admin.status")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td dir="ltr">#{String(o.orderId).slice(0, 8).toUpperCase()}</td>
                <td>{formatDate(o.createdAt)}</td>
                <td>
                  {o.customerInfo?.firstName} {o.customerInfo?.lastName}
                  <div className="admin-sub">{o.customerInfo?.email}</div>
                </td>
                <td>{(o.items || []).map((i) => tc(i, "name") || tc(i, "destination")).join(", ")}</td>
                <td>₪{formatNumber(o.totalAmount)}</td>
                <td>
                  <span className={`admin-badge ${o.status === "cancelled" ? "red" : "green"}`}>
                    {o.status === "cancelled" ? t("profile.cancelled") : t("profile.completed")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (tab === "users") {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("common.fullName")}</th>
              <th>{t("common.email")}</th>
              <th>{t("common.phone")}</th>
              <th>{t("admin.role")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td dir="ltr">{u.email}</td>
                <td dir="ltr">{u.phone}</td>
                <td>
                  <span className={`admin-badge ${u.role === "admin" ? "purple" : ""}`}>{u.role}</span>
                </td>
                <td className="admin-actions">
                  {u.role !== "admin" && (
                    <button type="button" className="admin-icon-btn danger" onClick={() => setToDelete(u)} aria-label={t("common.delete")}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (tab === "reviews") {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.date")}</th>
              <th>{t("admin.reviewItem")}</th>
              <th>{t("admin.name")}</th>
              <th>{t("admin.rating")}</th>
              <th>{t("admin.message")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rv) => (
              <tr key={rv._id}>
                <td>{formatDate(rv.createdAt)}</td>
                <td>
                  <span className="admin-badge">{rv.itemType === "deal" ? t("common.deal") : t("common.attraction")}</span>
                  <div className="admin-sub">
                    {rv.itemType === "deal" ? tc({ destination: rv.itemKey }, "destination") : (isEn && rv.itemNameEn) || rv.itemName || rv.itemKey}
                  </div>
                </td>
                <td>{rv.userName}</td>
                <td className="admin-stars" aria-label={t("reviews.star", { n: rv.rating })}>
                  {"★".repeat(rv.rating)}
                </td>
                <td className="admin-message">{rv.comment}</td>
                <td className="admin-actions">
                  <button type="button" className="admin-icon-btn danger" onClick={() => setToDelete(rv)} aria-label={t("common.delete")}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // messages
    return (
      <table className="admin-table">
        <thead>
          <tr>
            <th>{t("admin.date")}</th>
            <th>{t("admin.name")}</th>
            <th>{t("common.email")} / {t("common.phone")}</th>
            <th>{t("admin.subject")}</th>
            <th>{t("admin.message")}</th>
            <th>{t("admin.handled")}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m._id} className={m.handled ? "is-done" : ""}>
              <td>{formatDate(m.createdAt)}</td>
              <td>{m.name}</td>
              <td dir="ltr">
                {m.email}
                {m.phone && <div className="admin-sub">{m.phone}</div>}
              </td>
              <td>{m.subject ? t(`contact.subjects.${m.subject}`, { defaultValue: m.subject }) : ""}</td>
              <td className="admin-message">{m.message}</td>
              <td>
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() => toggleHandled(m)}
                  aria-label={m.handled ? t("admin.markOpen") : t("admin.markHandled")}
                  title={m.handled ? t("admin.markOpen") : t("admin.markHandled")}
                >
                  {m.handled ? <CheckCircle2 size={18} className="admin-ok" /> : <Circle size={18} />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">
          <ShieldCheck size={26} aria-hidden="true" /> {t("admin.title")}
        </h1>

        <div className="admin-tabs" role="tablist">
          {["deals", "attractions", "orders", "users", "reviews", "messages"].map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`admin-tab ${tab === key ? "active" : ""}`}
              onClick={() => {
                setTab(key);
                setQuery("");
              }}
            >
              {t(`admin.tabs.${key}`)}
            </button>
          ))}
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-search"
            placeholder={t("admin.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {(tab === "deals" || tab === "attractions") && (
            <button type="button" className="admin-btn" onClick={() => setEditing({})}>
              <Plus size={16} /> {t("admin.addNew")}
            </button>
          )}
                  </div>

        <div className="admin-table-wrap">{renderTable()}</div>
      </div>

      {editing && <AdminItemForm type={tab} item={editing} onClose={() => setEditing(null)} onSave={saveItem} t={t} />}

      {toDelete && (
        <ConfirmDialog
          message={t("admin.confirmDelete")}
          confirmLabel={t("common.delete")}
          onCancel={() => setToDelete(null)}
          onConfirm={() => deleteRow(toDelete)}
        />
      )}
    </div>
  );
}
