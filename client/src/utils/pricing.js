/**
 * Booking price rules (ILS). The server uses the same rules in controllers/Order.js,
 * so the total the user sees is the total that gets saved.
 */
export const EXTRA_CANCELLABLE = 55;
export const TROLLEY = 102;
export const SUITCASE = 224;
export const TRANSFER_PER_PERSON = 57;
export const DEAL_CHILD_RATE = 0.7;
export const ATTRACTION_CHILD_RATE = 0.6;

export const DEFAULT_DEAL_OPTIONS = {
  adults: 2,
  children: 0,
  trolley: false,
  suitcase: false,
  transfer: false,
  cancellable: false,
};
export const DEFAULT_ATTRACTION_QTY = { adults: 1, children: 0, infants: 0 };

export const dealAdultPrice = (price, opts) => (opts.cancellable ? price + EXTRA_CANCELLABLE : price);
export const dealChildPrice = (price, opts) => Math.round(dealAdultPrice(price, opts) * DEAL_CHILD_RATE);

export const calcDealTotal = (price, opts) => {
  let total = dealAdultPrice(price, opts) * opts.adults + dealChildPrice(price, opts) * opts.children;
  if (opts.trolley) total += TROLLEY;
  if (opts.suitcase) total += SUITCASE;
  if (opts.transfer) total += TRANSFER_PER_PERSON * (opts.adults + opts.children);
  return total;
};

export const attractionChildPrice = (a) =>
  a.childPrice != null ? a.childPrice : Math.round((a.price || 0) * ATTRACTION_CHILD_RATE);

export const calcAttractionTotal = (a, qty) =>
  (a.price || 0) === 0 ? 0 : a.price * qty.adults + attractionChildPrice(a) * qty.children; // infants are free
