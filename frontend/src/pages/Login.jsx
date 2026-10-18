import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { saveUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      saveUser(data);
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form onSubmit={submit} className="panel mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Log in</h1>
      <input className="field" type="email" placeholder="Email" required value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="field" type="password" placeholder="Password" required value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary w-full" type="submit">Log in</button>
      <p className="text-muted">New here? <Link to="/register" className="font-semibold underline">Create an account</Link></p>
    </form>
  );
}
