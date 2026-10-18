import Review from "../models/Review.js";

export const getReviews = async (req, res) => {
  const reviews = await Review.find({ mealId: req.params.mealId }).sort({ createdAt: -1 });
  const count = reviews.length;
  const average = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  res.json({ reviews, average, count });
};

export const addReview = async (req, res) => {
  const rating = Number(req.body.rating);
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be from 1 to 5" });
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, mealId: req.params.mealId },
    { rating, comment: (req.body.comment || "").trim(), userName: req.user.name },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(review);
};

export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.reviewId).catch(() => null);
  if (!review) return res.status(404).json({ message: "Review not found" });
  if (String(review.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only delete your own review" });
  }
  await review.deleteOne();
  res.json({ message: "Review deleted" });
};
