import Favourite from "../models/Favourite.js";

export const getFavourites = async (req, res) => {
  const list = await Favourite.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(list.map((f) => ({ id: f.mealId, name: f.name, image: f.image })));
};

export const addFavourite = async (req, res) => {
  const { mealId, name, image } = req.body;
  if (!mealId || !name) return res.status(400).json({ message: "mealId and name are required" });
  await Favourite.findOneAndUpdate(
    { user: req.user._id, mealId },
    { name, image },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ message: "Saved to favourites" });
};

export const removeFavourite = async (req, res) => {
  await Favourite.deleteOne({ user: req.user._id, mealId: req.params.mealId });
  res.json({ message: "Removed from favourites" });
};
