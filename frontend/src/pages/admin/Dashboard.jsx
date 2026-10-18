import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

const CARDS = [
  ["users", "Users", "/admin/users"],
  ["recipes", "Admin-added recipes", "/admin/recipes"],
  ["reviews", "Reviews", "/admin/reviews"],
  ["favourites", "Saved favourites", null],
  ["categories", "Extra categories", "/admin/recipes"],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Admin dashboard</h1>
      <AdminNav />
      {error && <p className="error">{error}</p>}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {CARDS.map(([key, label, to]) => (
            <div key={key} className="panel">
              <p className="font-display text-4xl font-bold">{stats[key]}</p>
              <p className="text-muted">{label}</p>
              {to && <Link to={to} className="mt-2 inline-block font-semibold underline">Manage</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
