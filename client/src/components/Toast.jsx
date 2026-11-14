import { useEffect, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import "./Toast.css";

/**
 * Small in-page notifications that disappear on their own (replaces window.alert).
 * Usage anywhere:  toast.success("Added!")  /  toast.error("...")  /  toast.info("...")
 */
const listeners = new Set();
let nextId = 1;

const push = (type, message, duration = 3500) => {
  const item = { id: nextId++, type, message, duration };
  listeners.forEach((fn) => fn(item));
  return item.id;
};

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  success: (msg, ms) => push("success", msg, ms),
  error: (msg, ms) => push("error", msg, ms ?? 5000),
  info: (msg, ms) => push("info", msg, ms),
};

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export const Toaster = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onToast = (item) => {
      setItems((prev) => [...prev.slice(-3), item]); // keep at most 4 on screen
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== item.id)), item.duration);
    };
    listeners.add(onToast);
    return () => listeners.delete(onToast);
  }, []);

  return (
    <div className="toaster" aria-live="polite">
      {items.map((item) => {
        const Icon = ICONS[item.type] || Info;
        return (
          <div key={item.id} className={`toast toast-${item.type}`} role={item.type === "error" ? "alert" : "status"}>
            <Icon size={20} className="toast-icon" aria-hidden="true" />
            <span className="toast-msg">{item.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Close"
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
