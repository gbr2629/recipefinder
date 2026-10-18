import { useState } from "react";
import api, { errMsg } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, saveUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email, password: "" });
  const [msg, setMsg] = useState({ text: "", bad: false });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = { name: form.name, email: form.email };
      if (form.password) body.password = form.password;
      const { data } = await api.put("/auth/profile", body);
      saveUser(data);
      setForm({ ...form, password: "" });
      setMsg({ text: "Profile saved", bad: false });
    } catch (err) {
      setMsg({ text: errMsg(err), bad: true });
    }
  };

  return (
    <form onSubmit={submit} className="panel mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Your profile</h1>
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
  );
}
