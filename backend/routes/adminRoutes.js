import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import * as c from "../controller/adminController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", c.getStats);

router.get("/users", c.getUsers);
router.delete("/users/:id", c.deleteUser);

router.get("/recipes", c.getRecipes);
router.post("/recipes", c.createRecipe);
router.put("/recipes/:id", c.updateRecipe);
router.delete("/recipes/:id", c.deleteRecipe);

router.get("/categories", c.getCategories);
router.post("/categories", c.createCategory);
router.delete("/categories/:id", c.deleteCategory);

router.get("/reviews", c.getAllReviews);
router.delete("/reviews/:id", c.adminDeleteReview);

export default router;
