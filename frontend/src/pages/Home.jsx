import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import SearchBar from "../components/SearchBar.jsx";
import TopRated from "../components/TopRated.jsx";

export default function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/recipes/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      <section className="max-w-2xl space-y-5">
        <h1 className="text-4xl font-bold sm:text-5xl">What is in your kitchen today?</h1>
        <p className="text-lg text-muted">
          Type the ingredients you already have, or search a dish by name. Every recipe comes with
          step-by-step instructions and a YouTube video to cook along with.
        </p>
        <SearchBar />
      </section>

      <TopRated />

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold">Browse by category</h2>
          <Link to="/random" className="btn btn-primary">Pick a recipe for this season</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.name} to={`/categories/${encodeURIComponent(c.name)}`}
              className="overflow-hidden rounded-xl border border-line bg-card no-underline">
              {c.image && <img src={c.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />}
              <span className="block p-3 font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
        {categories.length > 8 && <Link to="/categories" className="mt-4 inline-block font-semibold underline">See all categories</Link>}
      </section>
    </div>
  );
}
