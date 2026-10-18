import express from "express";
import { getReviews, addReview, deleteReview } from "../controller/reviewController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:mealId", getReviews);
router.post("/:mealId", protect, addReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;
