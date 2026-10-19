import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import StarRating from "./StarRating.jsx";

export default function TopRated() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/reviews/top").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  if (items.length === 0) return null; // nothing rated yet

  return (
    <section>
      <h2 className="text-2xl font-bold">Top rated recipes</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((r) => (
          <Link key={r.id} to={`/recipe/${r.id}`} className="overflow-hidden rounded-xl border border-line bg-card no-underline">
            {r.image && <img src={r.image} alt={r.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />}
            <div className="space-y-1 p-3">
              <h3 className="font-bold">{r.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted">
                <StarRating value={r.average} /> {r.average} ({r.count})
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
