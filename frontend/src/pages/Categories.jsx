import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import api, { errMsg } from "../api/axios.js";
import RecipeCard from "../components/RecipeCard.jsx";

export default function Categories() {
  const { name } = useParams();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/recipes/categories")
      .then((r) => setCategories(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    setRecipes(null);
    if (!name) return;
    setError("");
    api
      .get(`/recipes/category/${encodeURIComponent(name)}`)
      .then((r) => setRecipes(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [name]);

  const current = name ? categories.find((c) => c.name === name) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-card">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid items-center gap-6 px-6 py-10 sm:px-10 md:grid-cols-[1fr_auto]">
          <div className="fade-up">
            {name && (
              <Link
                to="/categories"
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                <FiArrowLeft /> All categories
              </Link>
            )}
            <h1 className="font-display text-4xl font-bold sm:text-5xl">{name || "All categories"}</h1>
            <p className="mt-3 max-w-2xl text-muted">
              {name
                ? current?.description || "Recipes in this category."
                : `Explore ${categories.length || ""} categories and find something to cook today.`}
            </p>
            {name && recipes && (
              <p className="mt-3 inline-block rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent">
                {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
              </p>
            )}
          </div>
          {name && current?.image && (
            <img
              src={current.image}
              alt={name}
              className="hidden h-40 w-52 rounded-2xl border-4 border-card object-cover shadow-2xl md:block"
            />
          )}
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
        <Link
          to="/categories"
          className={`btn whitespace-nowrap rounded-full ${!name ? "btn-primary" : ""}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.name}
            to={`/categories/${encodeURIComponent(c.name)}`}
            className={`btn whitespace-nowrap rounded-full ${name === c.name ? "btn-primary" : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* All categories grid */}
      {!name && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loadingCats &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-line" />
            ))}

          {!loadingCats &&
            categories.map((c) => (
              <Link
                key={c.name}
                to={`/categories/${encodeURIComponent(c.name)}`}
                className="group overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition hover:-translate-y-1 hover:border-accent hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-line text-muted">No photo</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <strong className="text-lg">{c.name}</strong>
                    <FiArrowRight className="text-accent opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                </div>
              </Link>
            ))}
        </div>
      )}

      {/* Recipes of selected category */}
      {name && recipes === null && !error && (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      )}

      {name && recipes?.length === 0 && (
        <div className="panel text-center text-muted">No recipes in this category yet.</div>
      )}

      {recipes?.length > 0 && (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((r) => (
            <div key={r.id} className="transition hover:-translate-y-1 hover:shadow-xl">
              <RecipeCard recipe={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}