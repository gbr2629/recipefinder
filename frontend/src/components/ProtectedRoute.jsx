import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();
  const loginPath = adminOnly ? "/admin/login" : "/login";

  if (!user) return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to={loginPath} replace />;
  return children;
}
