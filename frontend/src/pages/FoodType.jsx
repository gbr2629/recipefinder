import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import RecipeCard from "../components/RecipeCard.jsx";

const GROUPS = {
  veg: {
    title: "Vegetarian",
    text: "100% meat-free dishes: vegetarian and vegan recipes.",
    categories: ["Vegetarian", "Vegan"],
  },
  "non-veg": {
    title: "Non-Vegetarian",
    text: "Chicken, mutton, beef, pork and seafood dishes.",
    categories: ["Chicken", "Beef", "Lamb", "Pork", "Seafood"],
  },
};

export default function FoodType() {
  const { type } = useParams();
  const group = GROUPS[type];
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!group) return;
    setRecipes(null);
    setError("");
    setFilter("All");

    Promise.all(
      group.categories.map((c) =>
        api
          .get(`/recipes/category/${encodeURIComponent(c)}`)
          .then((r) => r.data.map((m) => ({ ...m, _cat: c })))
          .catch(() => [])
      )
    )
      .then((lists) => {
        const seen = new Set();
        const merged = lists.flat().filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setRecipes(merged);
      })
      .catch((e) => setError(errMsg(e)));
  }, [type]);

  const shown = useMemo(() => {
    if (!recipes) return null;
    return filter === "All" ? recipes : recipes.filter((m) => m._cat === filter);
  }, [recipes, filter]);

  if (!group) {
    return (
      <div className="panel text-center">
        <p className="text-muted">Unknown food type.</p>
        <Link to="/" className="btn mt-4">Go home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-card px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative fade-up">
          <span className="inline-flex items-center rounded-full border border-line bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            {type === "veg" ? "Veg" : "Non-veg"}
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{group.title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{group.text}</p>
          {shown && (
            <p className="mt-3 inline-block rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent">
              {shown.length} {shown.length === 1 ? "recipe" : "recipes"}
            </p>
          )}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
        {["All", ...group.categories].map((c) => (
          <button
            key={c}
            className={`btn whitespace-nowrap rounded-full ${filter === c ? "btn-primary" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      {shown === null && !error && (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      )}

      {shown && shown.length === 0 && (
        <div className="panel text-center text-muted">No recipes found.</div>
      )}

      {shown && shown.length > 0 && (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((r) => (
            <div key={r.id} className="transition hover:-translate-y-1 hover:shadow-xl">
              <RecipeCard recipe={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}