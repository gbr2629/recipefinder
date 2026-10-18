import express from "express";
import { getFavourites, addFavourite, removeFavourite } from "../controller/favouriteController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getFavourites);
router.post("/", addFavourite);
router.delete("/:mealId", removeFavourite);

export default router;
