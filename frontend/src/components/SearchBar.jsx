import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initialMode = "name", initialQuery = "" }) {
  const [mode, setMode] = useState(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?mode=${mode}&q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2" role="tablist" aria-label="Search type">
        {[["name", "By recipe name"], ["ingredients", "By ingredients I have"]].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`btn ${mode === value ? "btn-primary" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === "name" ? "e.g. Arrabiata" : "e.g. chicken, garlic, rice (separate with commas)"}
          aria-label="Search"
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </div>
    </form>
  );
}
