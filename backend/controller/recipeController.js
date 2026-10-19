import axios from "axios";
import Recipe from "../models/Recipe.js";
import Category from "../models/Category.js";

const api = axios.create({ baseURL: "https://www.themealdb.com/api/json/v1/1", timeout: 10000 });

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// TheMealDB has no cooking time, so we estimate it from the length of the instructions
const estimateTime = (text = "") => Math.min(120, Math.max(15, Math.round(text.length / 200) * 5 + 10));

const normalize = (m) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`];
    if (name && name.trim()) ingredients.push({ name: name.trim(), measure: (m[`strMeasure${i}`] || "").trim() });
  }
  return {
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
    category: m.strCategory,
    area: m.strArea,
    instructions: m.strInstructions,
    ingredients,
    youtube: m.strYoutube || "",
    cookingTime: estimateTime(m.strInstructions),
  };
};
const brief = (m) => ({ id: m.idMeal, name: m.strMeal, image: m.strMealThumb });
const fromDb = (r) => ({
  id: `c_${r._id}`,
  name: r.name,
  image: r.image,
  category: r.category,
  area: r.area,
  instructions: r.instructions,
  ingredients: r.ingredients,
  youtube: r.youtube,
  cookingTime: r.cookingTime,
  custom: true,
});
const briefDb = (r) => ({ id: `c_${r._id}`, name: r.name, image: r.image, custom: true });

export const lookup = async (id) => {
  if (id.startsWith("c_")) {
    const r = await Recipe.findById(id.slice(2)).catch(() => null);
    return r ? fromDb(r) : null;
  }
  const { data } = await api.get("/lookup.php", { params: { i: id } });
  return data.meals ? normalize(data.meals[0]) : null;
};

// Calls TheMealDB and always returns a list (empty list if nothing found or if the call fails)
const fetchMeals = (url, params) =>
  api
    .get(url, { params })
    .then((r) => (Array.isArray(r.data.meals) ? r.data.meals : []))
    .catch(() => []);

// Search by name, and also find related recipes (same ingredient, category or cuisine)
export const searchByName = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ message: "Enter a recipe name to search" });

  const lower = q.toLowerCase();
  // "eggs" -> "egg", so both "egg" and "eggs" recipes are found
  const words = [...new Set(lower.split(/\s+/).filter((w) => w.length >= 3))]
    .slice(0, 3)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));

  // Each search source has a weight. Better matches get a higher score.
  const sources = [{ weight: 50, promise: fetchMeals("/search.php", { s: q }) }];
  for (const w of words) {
    sources.push({ weight: 20, promise: fetchMeals("/search.php", { s: w }) });
    sources.push({ weight: 5, promise: fetchMeals("/filter.php", { i: w.replace(/\s+/g, "_") }) });
    sources.push({ weight: 3, promise: fetchMeals("/filter.php", { c: capitalize(w) }) });
    sources.push({ weight: 3, promise: fetchMeals("/filter.php", { a: capitalize(w) }) });
  }

  const found = new Map();
  const lists = await Promise.all(sources.map((s) => s.promise));
  lists.forEach((meals, i) => {
    for (const m of meals) {
      const entry = found.get(m.idMeal) || { meal: m, score: 0 };
      entry.score += sources[i].weight;
      found.set(m.idMeal, entry);
    }
  });

  // Bonus when the recipe name itself contains what the user typed
  for (const entry of found.values()) {
    const name = (entry.meal.strMeal || "").toLowerCase();
    if (name.includes(lower)) entry.score += 30;
    for (const w of words) if (name.includes(w)) entry.score += 10;
  }

  const meals = [...found.values()]
    .sort((a, b) => b.score - a.score || a.meal.strMeal.localeCompare(b.meal.strMeal))
    .slice(0, 60)
    .map((e) => brief(e.meal));

  // Recipes added by the admin
  const checks = [q, ...words].map((t) => new RegExp(escapeRegex(t), "i"));
  const mine = await Recipe.find({
    $or: checks.flatMap((re) => [{ name: re }, { category: re }, { area: re }]),
  });

  res.json([...mine.map(briefDb), ...meals]);
};

export const searchByIngredients = async (req, res) => {
  const list = (req.query.i || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!list.length) return res.status(400).json({ message: "Enter at least one ingredient" });

  // TheMealDB's free API only filters by one ingredient, so we fetch each and keep recipes that match all of them
  const results = await Promise.all(
    list.map((ing) => fetchMeals("/filter.php", { i: ing.replace(/\s+/g, "_") }))
  );
  let common = results[0];
  for (const next of results.slice(1)) {
    const ids = new Set(next.map((m) => m.idMeal));
    common = common.filter((m) => ids.has(m.idMeal));
  }
  const mine = await Recipe.find({ "ingredients.name": { $all: list.map((l) => new RegExp(escapeRegex(l), "i")) } });
  res.json([...mine.map(briefDb), ...common.map(brief)]);
};

export const getCategories = async (req, res) => {
  const { data } = await api.get("/categories.php");
  const list = data.categories.map((c) => ({ name: c.strCategory, image: c.strCategoryThumb, description: c.strCategoryDescription }));
  const known = new Set(list.map((c) => c.name.toLowerCase()));
  const extra = await Category.find();
  extra.forEach((c) => {
    if (!known.has(c.name.toLowerCase())) list.push({ name: c.name, image: "", description: c.description });
  });
  res.json(list);
};

export const getByCategory = async (req, res) => {
  const name = req.params.name;
  const [meals, mine] = await Promise.all([
    fetchMeals("/filter.php", { c: name }),
    Recipe.find({ category: new RegExp(`^${escapeRegex(name)}$`, "i") }),
  ]);
  res.json([...mine.map(briefDb), ...meals.map(brief)]);
};

// Seasons follow the Indian calendar
const getSeason = (month) => {
  if (month === 11 || month <= 1) return "winter";
  if (month <= 5) return "summer";
  if (month <= 8) return "monsoon";
  return "autumn";
};

// Each season picks from different food categories
const SEASON_CATEGORIES = {
  winter: ["Beef", "Lamb", "Goat", "Pork"],
  summer: ["Seafood", "Vegan", "Side", "Vegetarian"],
  monsoon: ["Starter", "Breakfast", "Chicken", "Miscellaneous"],
  autumn: ["Pasta", "Vegetarian", "Pork", "Side"],
};
const TYPE_CATEGORIES = { dessert: ["Dessert"], snack: ["Starter", "Side"] };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const randomRecipe = async (req, res) => {
  const currentSeason = getSeason(new Date().getMonth());
  const asked = (req.query.season || "").toLowerCase();
  const season = SEASON_CATEGORIES[asked] ? asked : currentSeason; // use the season the user clicked
  const type = (req.query.type || "").toLowerCase();
  const cats = TYPE_CATEGORIES[type] || SEASON_CATEGORIES[season];

  const meals = await fetchMeals("/filter.php", { c: pick(cats) });
  if (!meals.length) return res.status(404).json({ message: "No recipe found, try again" });
  const recipe = await lookup(pick(meals).idMeal);
  res.json({ season, currentSeason, type: type || "season", recipe });
};

export const getRecipe = async (req, res) => {
  const recipe = await lookup(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  res.json(recipe);
};