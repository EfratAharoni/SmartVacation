import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { apiFetch, apiJson } from "../utils/api";
import useLocalize from "../utils/useLocalize";
import "./Reviews.css";

/**
 * Reviews list + form.
 * itemType: "deal" | "attraction"; itemKey: destination name (deals) or attraction _id.
 */
const Reviews = ({ itemType, itemKey }) => {
  const { t, formatDate } = useLocalize();
  const [data, setData] = useState({ reviews: [], average: null, count: 0 });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const path = `/reviews/${itemType}/${encodeURIComponent(itemKey)}`;

  useEffect(() => {
    if (!itemKey) return;
    let cancelled = false;
    apiFetch(path)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && d && setData(d))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [path, itemKey]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setStatus({ type: "error", text: t("reviews.chooseRating") });
      return;
    }
    setSubmitting(true);
    setStatus({ type: "", text: "" });
    try {
      const { review } = await apiJson(path, { method: "POST", body: { rating, comment } });
      setData((d) => {
        const reviews = [review, ...d.reviews];
        return {
          reviews,
          count: reviews.length,
          average: reviews.reduce((s, r) => s + r.rating, 0) / reviews.length,
        };
      });
      setRating(0);
      setComment("");
      setStatus({ type: "success", text: t("reviews.thanks") });
    } catch (err) {
      setStatus({ type: "error", text: err.message || t("common.networkError") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-block" aria-labelledby={`reviews-${itemType}-${itemKey}`}>
      <div className="reviews-head">
        <h3 id={`reviews-${itemType}-${itemKey}`}>{t("reviews.title")}</h3>
        {data.count > 0 && (
          <span className="reviews-avg">
            <Star size={16} className="reviews-star filled" aria-hidden="true" />
            {t("reviews.average", { avg: data.average.toFixed(1), count: data.count })}
          </span>
        )}
      </div>

      {isLoggedIn ? (
        <form className="reviews-form" onSubmit={submit}>
          <div className="reviews-stars-input" role="radiogroup" aria-label={t("reviews.yourRating")}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={t("reviews.star", { n })}
                className="reviews-star-btn"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
              >
                <Star size={22} className={`reviews-star ${(hover || rating) >= n ? "filled" : ""}`} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("reviews.placeholder")}
            maxLength={1000}
            rows={3}
            required
            minLength={2}
          />
          <button type="submit" className="reviews-submit" disabled={submitting}>
            {submitting ? t("reviews.submitting") : t("reviews.submit")}
          </button>
          {status.text && (
            <p className={`reviews-status ${status.type}`} role="status">
              {status.text}
            </p>
          )}
        </form>
      ) : (
        <p className="reviews-login">
          <Link to="/login">{t("reviews.loginToReview")}</Link>
        </p>
      )}

      {data.count === 0 ? (
        <p className="reviews-empty">{t("reviews.noReviews")}</p>
      ) : (
        <ul className="reviews-list">
          {data.reviews.map((r) => (
            <li key={r._id} className="review-item">
              <div className="review-top">
                <strong>{r.userName}</strong>
                <span className="review-stars" aria-label={t("reviews.star", { n: r.rating })}>
                  {"★".repeat(r.rating)}
                  <span className="review-stars-empty">{"★".repeat(5 - r.rating)}</span>
                </span>
                <span className="review-date">{formatDate(r.createdAt)}</span>
              </div>
              <p className="review-text">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Reviews;
