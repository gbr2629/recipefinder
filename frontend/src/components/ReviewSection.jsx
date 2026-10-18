import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import StarRating from "./StarRating.jsx";

export default function ReviewSection({ mealId }) {
  const { user } = useAuth();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.get(`/reviews/${mealId}`).then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, [mealId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Pick a star rating first");
    try {
      await api.post(`/reviews/${mealId}`, { rating, comment });
      setComment("");
      setRating(0);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold">Ratings and reviews</h2>
      <p className="mt-1 flex items-center gap-2 text-muted">
        {data.count ? (
          <><StarRating value={data.average} /> {data.average} average from {data.count} {data.count === 1 ? "rating" : "ratings"}</>
        ) : "No ratings yet. Be the first to rate this recipe."}
      </p>

      {user ? (
        <form onSubmit={submit} className="panel mt-4 space-y-3">
          <StarRating value={rating} onChange={setRating} />
          <textarea className="field" rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="How did it turn out? Add any cooking tips." />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit">Post review</button>
          <p className="text-sm text-muted">Posting again replaces your earlier review.</p>
        </form>
      ) : (
        <p className="mt-4"><Link to="/login" className="font-semibold underline">Log in</Link> to rate and review.</p>
      )}

      <ul className="mt-6 space-y-3">
        {data.reviews.map((r) => (
          <li key={r._id} className="panel">
            <div className="flex items-center justify-between gap-2">
              <strong>{r.userName}</strong>
              <StarRating value={r.rating} />
            </div>
            {r.comment && <p className="mt-2">{r.comment}</p>}
            {user && String(user._id) === String(r.user) && (
              <button className="btn btn-danger mt-3" onClick={() => remove(r._id)}>Delete my review</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
