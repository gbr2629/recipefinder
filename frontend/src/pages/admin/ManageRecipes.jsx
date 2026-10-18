import { useEffect, useState } from "react";
import api, { errMsg } from "../../api/axios.js";
import AdminNav from "../../components/AdminNav.jsx";

const empty = { name: "", category: "Miscellaneous", area: "", image: "", youtube: "", cookingTime: 30, instructions: "", ingredientsText: "" };

// "Chicken - 500g" per line  <->  [{ name, measure }]
const parseIngredients = (text) =>
  text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, ...rest] = l.split("-");
    return { name: name.trim(), measure: rest.join("-").trim() };
  });
const stringifyIngredients = (list = []) => list.map((i) => (i.measure ? `${i.name} - ${i.measure}` : i.name)).join("\n");

export default function ManageRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api.get("/admin/recipes").then((r) => setRecipes(r.data)).catch((e) => setError(errMsg(e)));
    api.get("/recipes/categories").then((r) => setCategories(r.data.map((c) => c.name))).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const { ingredientsText, ...rest } = form;
    const body = { ...rest, cookingTime: Number(form.cookingTime) || 30, ingredients: parseIngredients(ingredientsText) };
    try {
      if (editId) await api.put(`/admin/recipes/${editId}`, body);
      else await api.post("/admin/recipes", body);
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const edit = (r) => {
    setEditId(r._id);
    setForm({ ...empty, ...r, ingredientsText: stringifyIngredients(r.ingredients) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.name}"?`)) return;
    try {
      await api.delete(`/admin/recipes/${r._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    try {
      await api.post("/admin/categories", { name: newCat.trim() });
      setNewCat("");
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Recipes</h1>
      <AdminNav />
      {error && <p className="error mb-3">{error}</p>}

      <form onSubmit={submit} className="panel space-y-3">
        <h2 className="text-xl font-bold">{editId ? "Edit recipe" : "Add a recipe"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="field" placeholder="Recipe name" required value={form.name} onChange={set("name")} />
          <select className="field" value={form.category} onChange={set("category")}>
            {[...new Set([...categories, form.category])].map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="field" placeholder="Cuisine (e.g. Indian)" value={form.area} onChange={set("area")} />
          <input className="field" type="number" min="1" placeholder="Cooking time (minutes)" value={form.cookingTime} onChange={set("cookingTime")} />
          <input className="field" placeholder="Image URL" value={form.image} onChange={set("image")} />
          <input className="field" placeholder="YouTube link" value={form.youtube} onChange={set("youtube")} />
        </div>
        <textarea className="field" rows={4} placeholder={"Ingredients, one per line:\nChicken - 500g\nOnion - 2"} value={form.ingredientsText} onChange={set("ingredientsText")} />
        <textarea className="field" rows={6} placeholder="Instructions, one step per line" required value={form.instructions} onChange={set("instructions")} />
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">{editId ? "Save changes" : "Add recipe"}</button>
          {editId && <button type="button" className="btn" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <h2 className="mb-3 mt-8 text-xl font-bold">Recipes you added</h2>
      {recipes.length === 0 && <p className="text-muted">None yet. Recipes from TheMealDB are not listed here.</p>}
      <ul className="space-y-2">
        {recipes.map((r) => (
          <li key={r._id} className="panel flex flex-wrap items-center justify-between gap-2">
            <span><strong>{r.name}</strong> <span className="text-muted">{r.category}</span></span>
            <span className="flex gap-2">
              <button className="btn" onClick={() => edit(r)}>Edit</button>
              <button className="btn btn-danger" onClick={() => remove(r)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-8 text-xl font-bold">Add a category</h2>
      <form onSubmit={addCategory} className="flex max-w-md gap-2">
        <input className="field" placeholder="Category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
    </div>
  );
}
