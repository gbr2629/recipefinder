import { NavLink } from "react-router-dom";

const link = ({ isActive }) => `btn ${isActive ? "btn-primary" : ""}`;

export default function AdminNav() {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <NavLink to="/admin" end className={link}>Dashboard</NavLink>
      <NavLink to="/admin/users" className={link}>Users</NavLink>
      <NavLink to="/admin/recipes" className={link}>Recipes</NavLink>
      <NavLink to="/admin/reviews" className={link}>Reviews</NavLink>
    </div>
  );
}
