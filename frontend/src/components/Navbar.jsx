import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiSearch } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const link = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
    isActive ? "bg-accent text-accent-ink" : "text-ink hover:bg-line"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?mode=name&q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Link to="/" className="mr-1 whitespace-nowrap font-display text-xl font-bold">
          Recipe Finder
        </Link>

        <div className="flex flex-wrap items-center gap-0.5">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/categories" className={link}>Categories</NavLink>
          <NavLink to="/food/veg" className={link}>Veg</NavLink>
          <NavLink to="/food/non-veg" className={link}>Non-veg</NavLink>
          <NavLink to="/random" className={link}>Surprise me</NavLink>
          {user && <NavLink to="/favourites" className={link}>Favourites</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin" className={link}>Admin</NavLink>}
        </div>

        <form
          onSubmit={onSearch}
          className="relative order-last w-full lg:order-none lg:w-52 xl:w-64"
        >
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="field !py-1.5 !pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes..."
            aria-label="Search recipes"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="btn !px-2.5 !py-1.5"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="btn whitespace-nowrap !py-1.5">{user.name}</Link>
              <button
                className="btn whitespace-nowrap !py-1.5"
                onClick={() => { logout(); navigate("/"); }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn whitespace-nowrap !py-1.5">Log in</Link>
              <Link to="/register" className="btn btn-primary whitespace-nowrap !py-1.5">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}