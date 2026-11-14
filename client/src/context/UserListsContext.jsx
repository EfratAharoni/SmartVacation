import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { rollSavedDealForward } from "../utils/dealDates";

/**
 * Single place that owns the cart & favorites.
 * Stored per user in localStorage (cart_<user> / favorites_<user>) and synced to the
 * server by utils/userSync.js, which listens to the "userDataUpdated" event.
 */
const UserListsContext = createContext(null);

const getUserKey = () => {
  const name = localStorage.getItem("userName");
  return name ? name.replace(/\s/g, "_") : null;
};
const readLoggedIn = () => localStorage.getItem("isLoggedIn") === "true" && !!getUserKey();
const readList = (kind) => {
  const key = getUserKey();
  if (!key) return [];
  try {
    const list = JSON.parse(localStorage.getItem(`${kind}_${key}`) || "[]");
    // deals saved a while ago may hold dates that have passed – move them to the future
    return Array.isArray(list) ? list.map((item) => rollSavedDealForward(item)) : [];
  } catch {
    return [];
  }
};

/** Stable identity of a cart/favorite item */
// eslint-disable-next-line react-refresh/only-export-components
export const itemKey = (item) => item?._id || item?.id;
const same = (a, b) => itemKey(a) === itemKey(b) && (a.type || "deal") === (b.type || "deal");

export const UserListsProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(readLoggedIn);
  const [cart, setCart] = useState(() => readList("cart"));
  const [favorites, setFavorites] = useState(() => readList("favorites"));

  // reload when login state or lists change elsewhere (login, sync from server, other tab)
  useEffect(() => {
    const reload = () => {
      setIsLoggedIn(readLoggedIn());
      setCart(readList("cart"));
      setFavorites(readList("favorites"));
    };
    window.addEventListener("userDataUpdated", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("userDataUpdated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const save = useCallback((kind, list) => {
    const key = getUserKey();
    if (!key) return;
    localStorage.setItem(`${kind}_${key}`, JSON.stringify(list));
    (kind === "cart" ? setCart : setFavorites)(list);
    window.dispatchEvent(new Event("userDataUpdated"));
  }, []);

  const isInCart = useCallback((item) => cart.some((c) => same(c, item)), [cart]);
  const isFavorite = useCallback((item) => favorites.some((f) => same(f, item)), [favorites]);

  /** returns "added" | "exists" | "login" */
  const addToCart = useCallback(
    (item) => {
      if (!readLoggedIn()) return "login";
      const current = readList("cart");
      if (current.some((c) => same(c, item))) return "exists";
      save("cart", [...current, { ...item, addedAt: new Date().toISOString() }]);
      return "added";
    },
    [save]
  );

  const updateCartItem = useCallback(
    (item, patch) => save("cart", readList("cart").map((c) => (same(c, item) ? { ...c, ...patch } : c))),
    [save]
  );
  const removeFromCart = useCallback((item) => save("cart", readList("cart").filter((c) => !same(c, item))), [save]);
  const clearCart = useCallback(() => save("cart", []), [save]);

  /** returns "added" | "removed" | "login" */
  const toggleFavorite = useCallback(
    (item) => {
      if (!readLoggedIn()) return "login";
      const current = readList("favorites");
      if (current.some((f) => same(f, item))) {
        save("favorites", current.filter((f) => !same(f, item)));
        return "removed";
      }
      save("favorites", [...current, item]);
      return "added";
    },
    [save]
  );
  const removeFavorite = useCallback(
    (item) => save("favorites", readList("favorites").filter((f) => !same(f, item))),
    [save]
  );
  const clearFavorites = useCallback(() => save("favorites", []), [save]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      cart,
      favorites,
      isInCart,
      isFavorite,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [isLoggedIn, cart, favorites, isInCart, isFavorite, addToCart, updateCartItem, removeFromCart, clearCart, toggleFavorite, removeFavorite, clearFavorites]
  );

  return <UserListsContext.Provider value={value}>{children}</UserListsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserLists = () => {
  const ctx = useContext(UserListsContext);
  if (!ctx) throw new Error("useUserLists must be used inside <UserListsProvider>");
  return ctx;
};
