import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

const CARDS = [
  ["users", "Total users", "/admin/users"],
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
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {CARDS.map(([key, label, to]) => (
              <div key={key} className="panel">
                <p className="font-display text-4xl font-bold">{stats[key]}</p>
                <p className="text-muted">{label}</p>
                {to && <Link to={to} className="mt-2 inline-block font-semibold underline">Manage</Link>}
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-xl font-bold">Newest users</h2>
          <ul className="space-y-2">
            {stats.recentUsers.map((u) => (
              <li key={u._id} className="panel flex flex-wrap justify-between gap-2">
                <span><strong>{u.name}</strong> <span className="text-muted">{u.email}</span></span>
                <span className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
