import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const link = ({ isActive }) =>
  `px-2 py-1 rounded-md font-medium ${isActive ? "bg-accent text-accent-ink" : "text-ink hover:bg-line"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="border-b border-line bg-card">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 font-display text-xl font-bold no-underline">Recipe Finder</Link>
        <NavLink to="/" end className={link}>Home</NavLink>
        <NavLink to="/categories" className={link}>Categories</NavLink>
        <NavLink to="/random" className={link}>Surprise me</NavLink>
        {user && <NavLink to="/favourites" className={link}>Favourites</NavLink>}
        <NavLink to={user?.role === "admin" ? "/admin" : "/admin/login"} className={link}>Admin</NavLink>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button className="btn" onClick={toggle} aria-label="Switch theme">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="btn">{user.name}</Link>
              <button className="btn" onClick={() => { logout(); navigate("/"); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
