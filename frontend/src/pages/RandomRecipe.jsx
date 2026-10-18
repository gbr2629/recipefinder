import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";

const SEASONS = [
  ["autumn", "Autumn"],
  ["winter", "Winter"],
  ["summer", "Summer"],
  ["monsoon", "Monsoon"],
];

const TYPES = [
  ["season", "Seasonal dish"],
  ["dessert", "Dessert"],
  ["snack", "Snack"],
];

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export default function RandomRecipe() {
  const [type, setType] = useState("season");
  const [season, setSeason] = useState(""); // empty = current season
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const roll = useCallback(() => {
    setData(null);
    setError("");
    const params = { type };
    if (type === "season" && season) params.season = season;
    api
      .get("/recipes/random", { params })
      .then((r) => setData(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [type, season]);

  useEffect(() => {
    roll();
  }, [roll]);

  const r = data?.recipe;
  const shownSeason = data?.season;
  const activeSeason = season || data?.currentSeason || "";

  const subtitle = !data
    ? "Finding something good..."
    : type === "season"
    ? shownSeason === data.currentSeason
      ? `It is ${cap(shownSeason)} right now, so we picked a dish that suits the season.`
      : `Here is a dish that suits ${cap(shownSeason)}.`
    : type === "dessert"
    ? "Something sweet to end the meal."
    : "A quick bite for any time of day.";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-card px-6 py-10 text-center sm:px-10">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative fade-up">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Random Recipe</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">{subtitle}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {TYPES.map(([value, label]) => (
              <button
                key={value}
                className={`btn rounded-full px-5 ${type === value ? "btn-primary" : ""}`}
                onClick={() => setType(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {type === "season" && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SEASONS.map(([value, label]) => (
                <button
                  key={value}
                  className={`btn rounded-full px-4 ${activeSeason === value ? "btn-primary" : ""}`}
                  onClick={() => setSeason(value)}
                >
                  {label}
                  {data?.currentSeason === value && <span className="text-xs opacity-80">(now)</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {error && <p className="error text-center">{error}</p>}

      {/* Loading */}
      {!r && !error && (
        <div className="grid animate-pulse gap-0 overflow-hidden rounded-3xl border border-line bg-card md:grid-cols-2">
          <div className="aspect-[4/3] bg-line" />
          <div className="space-y-4 p-8">
            <div className="h-8 w-3/4 rounded bg-line" />
            <div className="h-4 w-1/2 rounded bg-line" />
            <div className="h-10 w-40 rounded bg-line" />
          </div>
        </div>
      )}

      {/* Result */}
      {r && (
        <article className="fade-up grid overflow-hidden rounded-3xl border border-line bg-card shadow-xl md:grid-cols-2">
          {r.image ? (
            <img src={r.image} alt={r.name} className="h-full max-h-96 w-full object-cover md:max-h-none" />
          ) : (
            <div className="flex min-h-64 items-center justify-center bg-line text-muted">No photo</div>
          )}

          <div className="flex flex-col justify-center space-y-5 p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {type === "season" ? `${cap(shownSeason)} pick` : "Today's pick"}
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{r.name}</h2>

            <div className="flex flex-wrap gap-2 text-sm">
              {r.category && (
                <span className="rounded-full border border-line bg-bg px-3 py-1">{r.category}</span>
              )}
              {r.area && (
                <span className="rounded-full border border-line bg-bg px-3 py-1">{r.area}</span>
              )}
              {r.cookingTime && (
                <span className="rounded-full border border-line bg-bg px-3 py-1">about {r.cookingTime} min</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={`/recipe/${r.id}`} className="btn btn-primary px-6 py-3">
                View full recipe
              </Link>
              <button className="btn px-6 py-3" onClick={roll}>
                Show me another
              </button>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}