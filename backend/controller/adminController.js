import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import Favourite from "../models/Favourite.js";
import Category from "../models/Category.js";

export const getStats = async (req, res) => {
  const [users, recipes, reviews, favourites, categories] = await Promise.all([
    User.countDocuments(),
    Recipe.countDocuments(),
    Review.countDocuments(),
    Favourite.countDocuments(),
    Category.countDocuments(),
  ]);
  res.json({ users, recipes, reviews, favourites, categories });
};

// Users
export const getUsers = async (req, res) => res.json(await User.find().select("-password").sort({ createdAt: -1 }));

export const deleteUser = async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own account" });
  const user = await User.findById(req.params.id).catch(() => null);
  if (!user) return res.status(404).json({ message: "User not found" });
  await Promise.all([Review.deleteMany({ user: user._id }), Favourite.deleteMany({ user: user._id }), user.deleteOne()]);
  res.json({ message: "User deleted" });
};

// Recipes
export const getRecipes = async (req, res) => res.json(await Recipe.find().sort({ createdAt: -1 }));

export const createRecipe = async (req, res) => {
  if (!req.body.name || !req.body.instructions) return res.status(400).json({ message: "Name and instructions are required" });
  res.status(201).json(await Recipe.create(req.body));
};

export const updateRecipe = async (req, res) => {
  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).catch(() => null);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  res.json(recipe);
};

export const deleteRecipe = async (req, res) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id).catch(() => null);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  await Review.deleteMany({ mealId: `c_${recipe._id}` });
  res.json({ message: "Recipe deleted" });
};

// Categories
export const getCategories = async (req, res) => res.json(await Category.find().sort({ name: 1 }));

export const createCategory = async (req, res) => {
  if (!req.body.name) return res.status(400).json({ message: "Category name is required" });
  try {
    res.status(201).json(await Category.create({ name: req.body.name, description: req.body.description }));
  } catch {
    res.status(400).json({ message: "That category already exists" });
  }
};

export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id).catch(() => null);
  res.json({ message: "Category deleted" });
};

// Reviews
export const getAllReviews = async (req, res) => res.json(await Review.find().sort({ createdAt: -1 }));

export const adminDeleteReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.id).catch(() => null);
  res.json({ message: "Review deleted" });
};
