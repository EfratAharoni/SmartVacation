import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./ConfirmDialog.css";

/** In-page "Are you sure?" dialog (replaces window.confirm) */
export default function ConfirmDialog({ message, confirmLabel, cancelLabel, onConfirm, onCancel, danger = true }) {
  const { t } = useTranslation();
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-btn ghost" onClick={onCancel}>
            {cancelLabel || t("common.cancel")}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={`confirm-btn ${danger ? "danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel || t("common.yes")}
          </button>
        </div>
      </div>
    </div>
  );
}
