import { useEffect, useState } from "react";
import { API_BASE_URL } from "./api";

/**
 * Optional ("nice to have") features that need server configuration:
 *  - emailEnabled:   password reset + order confirmation emails (SMTP_* env vars)
 *  - uploadsEnabled: admin image upload to Cloudinary (CLOUDINARY_URL env var)
 * They stay hidden until the server reports them as configured.
 */
const OFF = { emailEnabled: false, uploadsEnabled: false };
let cached = null;
let pending = null;

const load = () => {
  if (!pending) {
    pending = fetch(`${API_BASE_URL}/config`)
      .then((r) => (r.ok ? r.json() : OFF))
      .catch(() => OFF)
      .then((cfg) => (cached = { ...OFF, ...cfg }));
  }
  return pending;
};

export default function useServerFeatures() {
  const [features, setFeatures] = useState(cached || OFF);
  useEffect(() => {
    if (cached) return;
    let alive = true;
    load().then((cfg) => alive && setFeatures(cfg));
    return () => {
      alive = false;
    };
  }, []);
  return features;
}
