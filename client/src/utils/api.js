import i18n from "../i18n";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const getAuthToken = () => localStorage.getItem("authToken") || "";

/**
 * fetch() wrapper for our API: adds the base URL, JSON headers,
 * the auth token (when logged in) and the current UI language,
 * so server messages come back in the right language.
 */
export const apiFetch = (path, options = {}) => {
  const token = getAuthToken();
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData; // file uploads
  const headers = {
    "Accept-Language": i18n.language || "he",
    ...(options.body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const body =
    options.body !== undefined && !isForm && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body;
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
};

/** Same as apiFetch but parses JSON and throws an Error(message) on non-2xx */
export const apiJson = async (path, options) => {
  const res = await apiFetch(path, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
};
