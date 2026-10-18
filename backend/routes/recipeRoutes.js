import express from "express";
import {
  searchByName,
  searchByIngredients,
  getCategories,
  getByCategory,
  randomRecipe,
  getRecipe,
} from "../controller/recipeController.js";

const router = express.Router();

router.get("/search", searchByName);
router.get("/ingredients", searchByIngredients);
router.get("/categories", getCategories);
router.get("/category/:name", getByCategory);
router.get("/random", randomRecipe);
router.get("/:id", getRecipe); // keep last

export default router;
