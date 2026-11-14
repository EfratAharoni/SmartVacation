import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiJson } from "../utils/api";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "./Login.css";
import "./PasswordReset.css";

const AuthShell = ({ title, subtitle, children }) => (
  <div className="login-page">
    <LanguageSwitcher className="floating" />
    <div className="login-container reset-container">
      <div className="login-form-section">
        <div className="login-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

/** Step 1: ask for the email, server sends a reset link */
export const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });
    try {
      const { message } = await apiJson("/users/forgot-password", { method: "POST", body: { email: email.trim() } });
      setStatus({ type: "success", text: message });
    } catch (err) {
      setStatus({ type: "error", text: err.message || t("common.networkError") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t("forgot.title")} subtitle={t("forgot.subtitle")}>
      <form className="login-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="reset-email">{t("common.email")}</label>
          <div className="input-wrapper">
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPlaceholder")}
              required
            />
          </div>
        </div>
        {status.text && (
          <p className={`reset-status ${status.type}`} role="status">
            {status.text}
          </p>
        )}
        <button type="submit" className={`submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
          {loading ? t("forgot.sending") : t("forgot.send")}
        </button>
        <div className="register-link">
          <p>
            <Link to="/login">{t("forgot.backToLogin")}</Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

/** Step 2: the link from the email lands here with ?token=... */
export const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setStatus({ type: "error", text: t("forgot.tooShort") });
    if (form.password !== form.confirm) return setStatus({ type: "error", text: t("forgot.mismatch") });
    setLoading(true);
    setStatus({ type: "", text: "" });
    try {
      await apiJson("/users/reset-password", { method: "POST", body: { token, newPassword: form.password } });
      setStatus({ type: "success", text: t("forgot.done") });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus({ type: "error", text: err.message || t("common.networkError") });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title={t("forgot.resetTitle")} subtitle="">
        <p className="reset-status error">{t("forgot.missingToken")}</p>
        <div className="register-link">
          <p>
            <Link to="/forgot-password">{t("forgot.send")}</Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("forgot.resetTitle")} subtitle={t("forgot.resetSubtitle")}>
      <form className="login-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="new-password">{t("forgot.newPassword")}</label>
          <div className="input-wrapper">
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">{t("forgot.confirmPassword")}</label>
          <div className="input-wrapper">
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>
        </div>
        {status.text && (
          <p className={`reset-status ${status.type}`} role="status">
            {status.text}
          </p>
        )}
        <button type="submit" className={`submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
          {loading ? t("forgot.saving") : t("forgot.save")}
        </button>
      </form>
    </AuthShell>
  );
};
