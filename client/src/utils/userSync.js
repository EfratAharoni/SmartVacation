/**
 * Keeps the cart & favorites (stored in localStorage, which the pages read)
 * in sync with the user's account on the server, so they follow the user
 * across devices and browsers.
 */
import { apiFetch, apiJson } from "./api";
import i18n from "../i18n";

const getUserKey = () => {
  const name = localStorage.getItem("userName");
  return name ? name.replace(/\s/g, "_") : null;
};

const isLoggedIn = () => localStorage.getItem("isLoggedIn") === "true" && !!localStorage.getItem("authToken");

const readList = (kind, key) => {
  try {
    return JSON.parse(localStorage.getItem(`${kind}_${key}`) || "[]");
  } catch {
    return [];
  }
};

const itemId = (item) => `${item?.type || "deal"}:${item?._id || item?.id}`;

/** Union of two lists, local items win on conflict (they are the most recent edits) */
const merge = (local, remote) => {
  const map = new Map();
  for (const item of remote || []) map.set(itemId(item), item);
  for (const item of local || []) map.set(itemId(item), item);
  return [...map.values()];
};

let pushTimer = null;
let suppressNextPush = false;

export const pushListsToServer = () => {
  if (!isLoggedIn()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    const key = getUserKey();
    if (!key) return;
    apiFetch("/users/me/lists", {
      method: "PUT",
      body: { cart: readList("cart", key), favorites: readList("favorites", key) },
    }).catch(() => {
      /* offline – will sync on next change */
    });
  }, 800);
};

/** Pull lists from the server, merge with what's local, and save both ways */
export const syncListsFromServer = async () => {
  if (!isLoggedIn()) return;
  const key = getUserKey();
  if (!key) return;
  try {
    const remote = await apiJson("/users/me/lists");
    const cart = merge(readList("cart", key), remote.cart);
    const favorites = merge(readList("favorites", key), remote.favorites);
    localStorage.setItem(`cart_${key}`, JSON.stringify(cart));
    localStorage.setItem(`favorites_${key}`, JSON.stringify(favorites));
    suppressNextPush = true;
    window.dispatchEvent(new Event("userDataUpdated"));
    pushListsToServer();
  } catch (err) {
    if (err.status === 401) {
      // token expired – log out locally
      ["userName", "isLoggedIn", "userEmail", "authToken", "userRole"].forEach((k) => localStorage.removeItem(k));
      window.dispatchEvent(new Event("userDataUpdated"));
    }
  }
};

/** Refresh role (for the admin link) */
export const refreshMe = async () => {
  if (!isLoggedIn()) return;
  try {
    const { user } = await apiJson("/users/me");
    if (user?.role) localStorage.setItem("userRole", user.role);
    window.dispatchEvent(new Event("userDataUpdated"));
  } catch {
    /* ignore */
  }
};

/** Call after a successful login/registration */
export const onLoggedIn = async (user) => {
  if (user?.role) localStorage.setItem("userRole", user.role);
  // remember the UI language on the account (used for emails)
  apiFetch("/users/me/language", { method: "PUT", body: { lang: i18n.language } }).catch(() => {});
  await syncListsFromServer();
};

/** Start listening for local changes; call once at app start */
export const initUserSync = () => {
  window.addEventListener("userDataUpdated", () => {
    if (suppressNextPush) {
      suppressNextPush = false;
      return;
    }
    pushListsToServer();
  });
  i18n.on("languageChanged", (lng) => {
    if (isLoggedIn()) apiFetch("/users/me/language", { method: "PUT", body: { lang: lng } }).catch(() => {});
  });
  syncListsFromServer();
  refreshMe();
};
