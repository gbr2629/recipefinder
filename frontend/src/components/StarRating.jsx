// Display mode: <StarRating value={4.5} />   Input mode: <StarRating value={r} onChange={setR} />
export default function StarRating({ value = 0, onChange }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = <span className={filled ? "text-accent" : "text-line"}>★</span>;
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="cursor-pointer border-0 bg-transparent p-0 text-3xl leading-none">
            {star}
          </button>
        ) : (
          <span key={n} className="text-xl leading-none">{star}</span>
        );
      })}
    </span>
  );
}
