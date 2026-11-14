/**
 * Small in-memory catalog of deals & attractions (by _id).
 * Used to find English translations for items that were saved before
 * translations existed (old cart / favorites / orders keep a copy of the item).
 */
import { API_BASE_URL } from "./api";

const byId = new Map();
// fallback for items whose _id no longer exists (e.g. after re-seeding the DB)
const attractionByName = new Map();
const dealByDestination = new Map();
const listeners = new Set();
let loading = null;
let version = 0;

const load = () => {
  if (loading) return loading;
  loading = Promise.all(
    ["deals", "attractions"].map((p) =>
      fetch(`${API_BASE_URL}/${p}`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
    )
  ).then(([deals, attractions]) => {
    for (const d of deals || []) {
      byId.set(String(d._id), d);
      if (!dealByDestination.has(d.destination)) dealByDestination.set(d.destination, d);
    }
    for (const a of attractions || []) {
      byId.set(String(a._id), a);
      attractionByName.set(a.name, a);
    }
    version++;
    listeners.forEach((fn) => fn(version));
  });
  return loading;
};

/** Current catalog entry for an item (cart/favorite/order item), if known */
export const getCatalogItem = (item) => {
  if (!item) return undefined;
  const id = item._id || item.itemId || item.id;
  const found = id ? byId.get(String(id)) : undefined;
  if (found) return found;
  if (item.type === "deal" || (!item.type && item.destination && !item.name)) {
    // only destination-level text is safe to borrow from another package of the same destination
    const d = dealByDestination.get(item.destination);
    return d ? { en: { destination: d.en?.destination } } : undefined;
  }
  return attractionByName.get(item.name);
};

/** Subscribe to catalog loads; triggers the first load */
export const subscribeCatalog = (fn) => {
  listeners.add(fn);
  load();
  return () => listeners.delete(fn);
};

export const getCatalogVersion = () => version;
