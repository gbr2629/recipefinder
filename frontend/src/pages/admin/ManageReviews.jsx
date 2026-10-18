import { useEffect, useState } from "react";
import api, { errMsg } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";
import StarRating from "../../components/StarRating.jsx";

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  const load = () => api.get("/admin/reviews").then((r) => setReviews(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Reviews</h1>
      <AdminNav />
      {error && <p className="error">{error}</p>}
      {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r._id} className="panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{r.userName}</strong>
              <StarRating value={r.rating} />
            </div>
            <p className="text-sm text-muted">Recipe ID: {r.mealId}</p>
            {r.comment && <p className="mt-2">{r.comment}</p>}
            <button className="btn btn-danger mt-3" onClick={() => remove(r._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
