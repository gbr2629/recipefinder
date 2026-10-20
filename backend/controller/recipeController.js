import axios from "axios";
import Recipe from "../models/Recipe.js";
import Category from "../models/Category.js";

const api = axios.create({ baseURL: "https://www.themealdb.com/api/json/v1/1", timeout: 20000 });

// Retry a failed or timed-out TheMealDB request up to 2 times
api.interceptors.response.use(undefined, async (err) => {
  const cfg = err.config;
  if (!cfg) return Promise.reject(err);
  cfg._retry = (cfg._retry || 0) + 1;
  if (cfg._retry > 2) return Promise.reject(err);
  await new Promise((r) => setTimeout(r, 500));
  return api(cfg);
});

// Small in-memory cache: repeated pages load fast, and if TheMealDB is down
// we can still show the last good answer.
const cache = new Map();
const TTL = 60 * 60 * 1000; // 1 hour
const cachedGet = async (url, params = {}) => {
  const key = url + JSON.stringify(params);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < TTL) return hit.data;
  try {
    const { data } = await api.get(url, { params });
    cache.set(key, { data, time: Date.now() });
    return data;
  } catch (err) {
    if (hit) return hit.data; // stale data is better than an error
    throw err;
  }
};

// Goat recipes are not shown anywhere on the site
const HIDDEN = ["goat"];
const isHidden = (name = "") => HIDDEN.includes(name.toLowerCase());

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// TheMealDB has no cooking time, so we estimate it from the length of the instructions
const estimateTime = (text = "") => Math.min(120, Math.max(15, Math.round(text.length / 200) * 5 + 10));

export const normalize = (m) => {
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
export const brief = (m) => ({ id: m.idMeal, name: m.strMeal, image: m.strMealThumb });
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

// Exported because reviewController.js imports it
export const lookup = async (id) => {
  if (id.startsWith("c_")) {
    const r = await Recipe.findById(id.slice(2)).catch(() => null);
    return r ? fromDb(r) : null;
  }
  const data = await cachedGet("/lookup.php", { i: id });
  return data.meals ? normalize(data.meals[0]) : null;
};

// Turns a failed TheMealDB call into a clear message instead of a crash
const safe = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ message: "Recipe service is slow right now, please try again" });
  }
};

export const searchByName = safe(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ message: "Enter a recipe name to search" });
  const [data, mine] = await Promise.all([
    cachedGet("/search.php", { s: q }),
    Recipe.find({ name: new RegExp(escapeRegex(q), "i"), category: { $not: /^goat$/i } }),
  ]);
  const meals = (data.meals || []).filter((m) => !isHidden(m.strCategory));
  res.json([...mine.map(briefDb), ...meals.map(brief)]);
});

export const searchByIngredients = safe(async (req, res) => {
  const list = (req.query.i || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!list.length) return res.status(400).json({ message: "Enter at least one ingredient" });

  // TheMealDB's free API only filters by one ingredient, so we fetch each and keep recipes that match all of them
  const results = await Promise.all(
    list.map((ing) => cachedGet("/filter.php", { i: ing.replace(/\s+/g, "_") }).then((d) => d.meals || []))
  );
  let common = results[0];
  for (const next of results.slice(1)) {
    const ids = new Set(next.map((m) => m.idMeal));
    common = common.filter((m) => ids.has(m.idMeal));
  }
  const mine = await Recipe.find({
    "ingredients.name": { $all: list.map((l) => new RegExp(escapeRegex(l), "i")) },
    category: { $not: /^goat$/i },
  });
  res.json([...mine.map(briefDb), ...common.map(brief)]);
});

// Used only if TheMealDB cannot be reached and nothing is cached yet
const FALLBACK_CATEGORIES = [
  "Beef", "Breakfast", "Chicken", "Dessert", "Lamb", "Miscellaneous",
  "Pasta", "Pork", "Seafood", "Side", "Starter", "Vegan", "Vegetarian",
];

export const getCategories = safe(async (req, res) => {
  let list;
  try {
    const data = await cachedGet("/categories.php");
    list = data.categories
      .filter((c) => !isHidden(c.strCategory))
      .map((c) => ({ name: c.strCategory, image: c.strCategoryThumb, description: c.strCategoryDescription }));
  } catch {
    list = FALLBACK_CATEGORIES.map((name) => ({ name, image: "", description: "" }));
  }
  const known = new Set(list.map((c) => c.name.toLowerCase()));
  const extra = await Category.find();
  extra.forEach((c) => {
    if (!isHidden(c.name) && !known.has(c.name.toLowerCase())) {
      list.push({ name: c.name, image: "", description: c.description });
    }
  });
  res.json(list);
});

export const getByCategory = safe(async (req, res) => {
  const name = req.params.name;
  if (isHidden(name)) return res.json([]);
  const [data, mine] = await Promise.all([
    cachedGet("/filter.php", { c: name }),
    Recipe.find({ category: new RegExp(`^${escapeRegex(name)}$`, "i") }),
  ]);
  res.json([...mine.map(briefDb), ...(data.meals || []).map(brief)]);
});

// Seasons follow the Indian calendar
const getSeason = (month) => {
  if (month === 11 || month <= 1) return "winter";
  if (month <= 5) return "summer";
  if (month <= 8) return "monsoon";
  return "autumn";
};
const SEASONS = ["winter", "summer", "monsoon", "autumn"];

const SEASON_CATEGORIES = {
  winter: ["Beef", "Lamb", "Chicken", "Pork"],
  summer: ["Seafood", "Vegetarian", "Vegan", "Starter", "Side"],
  monsoon: ["Starter", "Chicken", "Breakfast", "Side", "Miscellaneous"],
  autumn: ["Pasta", "Vegetarian", "Miscellaneous", "Chicken", "Seafood"],
};

// Dish-name keywords that suit each season
const SEASON_WORDS = {
  winter: /(soup|stew|roast|hotpot|pie|curry|casserole|chowder|braised|lamb|beef|pork|chocolate|pudding|gratin|dal|lentil|porridge)/i,
  summer: /(salad|chilled|cold|fruit|lemon|lime|grilled|seafood|prawn|fish|ice|yogurt|cucumber|coconut|mango|smoothie|sushi)/i,
  monsoon: /(pakora|fritter|bhaji|samosa|noodle|soup|ramen|chai|tikka|fried|fries|wings|cutlet|pancake|toast|spicy|masala|momo)/i,
  autumn: /(pumpkin|apple|mushroom|pasta|baked|bake|squash|potato|corn|chestnut|pear|lasagne|risotto|cinnamon|fig|roasted)/i,
};

const TYPE_CATEGORIES = { dessert: ["Dessert"] };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Snacks: TheMealDB has no "Snack" category, so we search several categories
// and keep only dishes whose name looks like a snack.
const SNACK_CATEGORIES = ["Starter", "Side", "Miscellaneous", "Breakfast", "Vegetarian", "Chicken", "Seafood"];
const SNACK_WORDS = /(fries|wings|nacho|samosa|bruschetta|fritter|dip|guacamole|hummus|cutlet|roll|toast|sandwich|burger|bite|ball|kofta|pakora|bhaji|tikka|kebab|nugget|popcorn|tempura|croquette|cake|pancake|taco|wrap|poutine|cornbread|patty|skewer|pizza)/i;
const NOT_SNACK = /(soup|stew|broth|curry|chowder|casserole|roast|salad|risotto|pasta|lasagne|biryani|pie|pudding)/i;

const fetchCategories = async (cats) => {
  const results = await Promise.all(
    cats.map((c) => cachedGet("/filter.php", { c }).then((d) => d.meals || []).catch(() => []))
  );
  return results.flat();
};

const getSnackMeals = async () => {
  const all = await fetchCategories(SNACK_CATEGORIES);
  const good = all.filter((m) => SNACK_WORDS.test(m.strMeal) && !NOT_SNACK.test(m.strMeal));
  if (good.length) return good;
  return all.filter((m) => !NOT_SNACK.test(m.strMeal));
};

const getSeasonMeals = async (season) => {
  const all = await fetchCategories(SEASON_CATEGORIES[season]);
  const matched = all.filter((m) => SEASON_WORDS[season].test(m.strMeal));
  return matched.length ? matched : all;
};

export const randomRecipe = safe(async (req, res) => {
  const currentSeason = getSeason(new Date().getMonth());
  const type = (req.query.type || "").toLowerCase();
  const asked = (req.query.season || "").toLowerCase();
  const season = SEASONS.includes(asked) ? asked : currentSeason;

  let meals;
  if (type === "snack") {
    meals = await getSnackMeals();
  } else if (type === "dessert") {
    meals = await fetchCategories(TYPE_CATEGORIES.dessert);
  } else {
    meals = await getSeasonMeals(season);
  }

  if (!meals.length) return res.status(404).json({ message: "No recipe found, try again" });
  const recipe = await lookup(pick(meals).idMeal);
  res.json({ season, currentSeason, type: type || "season", recipe });
});

export const getRecipe = safe(async (req, res) => {
  const recipe = await lookup(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  res.json(recipe);
});