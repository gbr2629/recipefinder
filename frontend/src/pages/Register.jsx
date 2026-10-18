import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { saveUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      saveUser(data);
      navigate("/");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form onSubmit={submit} className="panel mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <input className="field" placeholder="Name" required value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="field" type="email" placeholder="Email" required value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="field" type="password" placeholder="Password (at least 6 characters)" required minLength={6}
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary w-full" type="submit">Sign up</button>
      <p className="text-muted">Already have an account? <Link to="/login" className="font-semibold underline">Log in</Link></p>
    </form>
  );
}
