import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import ReviewSection from "../components/ReviewSection.jsx";
import "../print.css";

export default function RecipeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRecipe(null);
    api.get(`/recipes/${id}`).then((r) => setRecipe(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  useEffect(() => {
    if (!user) return setSaved(false);
    api.get("/favourites").then((r) => setSaved(r.data.some((f) => f.id === id))).catch(() => {});
  }, [id, user]);

  const toggleFavourite = async () => {
    try {
      if (saved) await api.delete(`/favourites/${id}`);
      else await api.post("/favourites", { mealId: id, name: recipe.name, image: recipe.image });
      setSaved(!saved);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!recipe) return <p className="text-muted">Loading recipe...</p>;

  const steps = (recipe.instructions || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <article>
      <div className="grid gap-6 md:grid-cols-2">
        {recipe.image && <img src={recipe.image} alt={recipe.name} className="no-print w-full rounded-xl object-cover" />}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{recipe.name}</h1>
          <p className="text-muted">
            {[recipe.category, recipe.area].filter(Boolean).join(" - ")} - about {recipe.cookingTime} minutes
          </p>
          <div className="no-print flex flex-wrap gap-2">
            <button className="btn" onClick={() => window.print()}>Print recipe</button>
            {recipe.youtube && (
              <a className="btn btn-primary" href={recipe.youtube} target="_blank" rel="noreferrer">Watch on YouTube</a>
            )}
            {user ? (
              <button className="btn" onClick={toggleFavourite}>{saved ? "Remove from favourites" : "Save to favourites"}</button>
            ) : (
              <Link className="btn" to="/login" state={{ from: `/recipe/${id}` }}>Log in to save</Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <section>
          <h2 className="text-2xl font-bold">Ingredients</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-card">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between gap-2 px-3 py-2">
                <span>{ing.name}</span><span className="text-muted">{ing.measure}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="md:col-span-2">
          <h2 className="text-2xl font-bold">Instructions</h2>
          <div className="mt-3 max-w-prose space-y-3">
            {steps.map((s, i) => <p key={i}>{s}</p>)}
          </div>
        </section>
      </div>

      <div className="no-print">
        <ReviewSection mealId={id} />
      </div>
    </article>
  );
}