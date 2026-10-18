import { Link } from "react-router-dom";

export default function RecipeCard({ recipe, onRemove }) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-card">
      <Link to={`/recipe/${recipe.id}`} className="block no-underline">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-line text-muted">No photo</div>
        )}
        <h3 className="p-3 text-lg font-bold">{recipe.name}</h3>
      </Link>
      {onRemove && (
        <div className="px-3 pb-3">
          <button className="btn btn-danger" onClick={() => onRemove(recipe.id)}>Remove from favourites</button>
        </div>
      )}
    </article>
  );
}
