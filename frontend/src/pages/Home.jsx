import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiVideo, FiHeart, FiStar, FiShuffle, FiArrowRight, FiList, FiShoppingBag } from "react-icons/fi";
import api from "../api/axios.js";
import SearchBar from "../components/SearchBar.jsx";

const QUICK_INGREDIENTS = ["Chicken", "Egg", "Rice", "Potato", "Tomato", "Garlic", "Cheese", "Beef"];

const COLLAGE_NAMES = ["Vegetarian", "Vegan", "Dessert", "Chicken"];

const FEATURES = [
  { icon: FiShoppingBag, title: "Cook with what you have", text: "Enter the ingredients in your kitchen and get recipes you can make right now." },
  { icon: FiVideo, title: "Video tutorials", text: "Every recipe comes with a YouTube video so you can cook along step by step." },
  { icon: FiHeart, title: "Save your favourites", text: "Create an account and keep the dishes you love in one place." },
  { icon: FiStar, title: "Ratings and reviews", text: "Rate recipes and read tips from other home cooks before you start." },
];

const STEPS = [
  { icon: FiSearch, title: "1. Search", text: "Type a dish name or the ingredients you already have." },
  { icon: FiList, title: "2. Pick a recipe", text: "Browse the results and open the one that looks good." },
  { icon: FiVideo, title: "3. Cook", text: "Follow the instructions and the video, then rate the dish." },
];

const TILTS = ["-rotate-6", "rotate-3", "rotate-6", "-rotate-3"];
const POSITIONS = ["left-4 top-0", "right-4 top-6", "left-10 bottom-0", "right-0 bottom-4"];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/recipes/categories")
      .then((r) => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const collage = COLLAGE_NAMES
    .map((n) => categories.find((c) => c.name === n && c.image))
    .filter(Boolean);

  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-card">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative grid items-center gap-10 px-6 py-14 sm:px-12 lg:grid-cols-2 lg:py-20">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Smart recipe finder &amp; food discovery platform
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              What is in your <span className="text-accent">kitchen</span> today?
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Type the ingredients you already have, or search a dish by name. Every recipe comes with
              step-by-step instructions and a YouTube video to cook along with.
            </p>

            <div className="panel mt-8 shadow-xl">
              <SearchBar />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Popular:</span>
              {QUICK_INGREDIENTS.map((item) => (
                <Link
                  key={item}
                  to={`/search?mode=ingredients&q=${encodeURIComponent(item)}`}
                  className="rounded-full border border-line bg-bg px-3 py-1 text-sm font-medium transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Collage: 3 veg + 1 non-veg */}
          <div className="relative hidden h-[420px] lg:block">
            {collage.map((c, i) => (
              <Link
                key={c.name}
                to={`/categories/${encodeURIComponent(c.name)}`}
                className={`absolute w-52 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-2xl transition duration-300 hover:z-10 hover:scale-105 ${TILTS[i]} ${POSITIONS[i]}`}
              >
                <img src={c.image} alt={c.name} className="aspect-[4/3] w-full object-cover" />
                <span className="block bg-card p-2 text-center text-sm font-semibold">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to cook</h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted">From finding a recipe to rating the final dish, all in one place.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="panel transition hover:-translate-y-1 hover:border-accent hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Browse by category</h2>
            <p className="mt-1 text-muted">Pick a category and see what you can cook.</p>
          </div>
          {categories.length > 8 && (
            <Link to="/categories" className="inline-flex items-center gap-2 font-semibold text-accent hover:underline">
              See all categories <FiArrowRight />
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-line" />
            ))}

          {!loading &&
            categories.slice(0, 8).map((c) => (
              <Link
                key={c.name}
                to={`/categories/${encodeURIComponent(c.name)}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {c.image && (
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-lg font-bold text-white">
                  {c.name}
                  <FiArrowRight className="opacity-0 transition group-hover:opacity-100" />
                </span>
              </Link>
            ))}
        </div>

        {!loading && categories.length === 0 && (
          <p className="mt-4 text-muted">Categories could not be loaded. Check that the backend is running.</p>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mt-2 text-muted">Three simple steps from hungry to happy.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="relative rounded-2xl border border-line bg-card p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg">
                <Icon size={26} />
              </div>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-1 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SURPRISE BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-accent px-6 py-14 text-center text-accent-ink sm:px-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-black/10 blur-2xl" />
        <div className="relative">
          <FiShuffle size={36} className="mx-auto" />
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Cannot decide what to cook?</h2>
          <p className="mx-auto mt-2 max-w-xl opacity-90">
            Let us pick a seasonal dish, a dessert or a snack for you.
          </p>
          <Link
            to="/random"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 shadow-lg transition hover:scale-105"
          >
            Surprise me <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}