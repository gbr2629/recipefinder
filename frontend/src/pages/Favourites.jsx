import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import RecipeCard from "../components/RecipeCard.jsx";

export default function Favourites() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/favourites").then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/favourites/${id}`);
      setList((l) => l.filter((r) => r.id !== id));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your favourites</h1>
      {error && <p className="error">{error}</p>}
      {list === null && !error && <p className="text-muted">Loading...</p>}
      {list?.length === 0 && (
        <p className="text-muted">Nothing saved yet. <Link to="/" className="font-semibold underline">Find a recipe</Link> and tap "Save to favourites".</p>
      )}
      {list?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((r) => <RecipeCard key={r.id} recipe={r} onRemove={remove} />)}
        </div>
      )}
    </div>
  );
}
