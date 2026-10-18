import { useEffect, useState } from "react";
import api, { errMsg } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = () => api.get("/admin/users").then((r) => setUsers(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? Their reviews and favourites are deleted too.`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Users</h1>
      <AdminNav />
      {error && <p className="error">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-muted"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Joined</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-line">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-2 text-right">
                  {u.role !== "admin" && <button className="btn btn-danger" onClick={() => remove(u)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
