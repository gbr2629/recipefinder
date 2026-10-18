import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import SearchBar from "../components/SearchBar.jsx";
import RecipeCard from "../components/RecipeCard.jsx";

export default function SearchResults() {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "ingredients" ? "ingredients" : "name";
  const q = params.get("q") || "";
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q) return;
    setResults(null);
    setError("");
    const url = mode === "name" ? "/recipes/search" : "/recipes/ingredients";
    api.get(url, { params: mode === "name" ? { q } : { i: q } })
      .then((r) => setResults(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [mode, q]);

  return (
    <div className="space-y-6">
      <SearchBar key={mode + q} initialMode={mode} initialQuery={q} />
      {error && <p className="error">{error}</p>}
      {!error && results === null && q && <p className="text-muted">Searching...</p>}
      {results && results.length === 0 && (
        <p className="text-muted">
          No recipes found for "{q}". {mode === "ingredients" ? "Try fewer ingredients." : "Check the spelling or try a shorter name."}
        </p>
      )}
      {results && results.length > 0 && (
        <>
          <p className="text-muted">{results.length} recipes found</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </>
      )}
    </div>
  );
}
