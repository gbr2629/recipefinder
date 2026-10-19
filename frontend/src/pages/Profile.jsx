import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, saveUser } = useAuth();
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ name: user.name, email: user.email, password: "" });
  const [msg, setMsg] = useState({ text: "", bad: false });

  const loadInfo = () => api.get("/auth/profile").then((r) => setInfo(r.data)).catch(() => {});
  useEffect(() => { loadInfo(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = { name: form.name, email: form.email };
      if (form.password) body.password = form.password;
      const { data } = await api.put("/auth/profile", body);
      saveUser(data);
      setForm({ ...form, password: "" });
      setMsg({ text: "Profile saved", bad: false });
      loadInfo();
    } catch (err) {
      setMsg({ text: errMsg(err), bad: true });
    }
  };

  const stat = (label, value) => (
    <div className="rounded-lg border border-line p-3">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">My account</h1>

      <section className="panel space-y-4">
        <div>
          <p className="text-xl font-bold">{info?.name || user.name}</p>
          <p className="text-muted">{info?.email || user.email}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {stat("Member since", info ? new Date(info.createdAt).toLocaleDateString() : "...")}
          {stat("Saved recipes", info ? info.favourites : "...")}
          {stat("Reviews written", info ? info.reviews : "...")}
        </div>
        <Link to="/favourites" className="inline-block font-semibold underline">View my saved recipes</Link>
      </section>

      <form onSubmit={submit} className="panel space-y-4">
        <h2 className="text-xl font-bold">Edit profile</h2>
        <label className="block">Name
          <input className="field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="block">Email
          <input className="field mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="block">New password
          <input className="field mt-1" type="password" placeholder="Leave blank to keep the current one" minLength={6}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {msg.text && <p className={msg.bad ? "error" : "font-semibold"}>{msg.text}</p>}
        <button className="btn btn-primary" type="submit">Save changes</button>
      </form>
    </div>
  );
}
