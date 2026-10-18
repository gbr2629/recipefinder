import mongoose from "mongoose";

// Only recipes added by the admin live here. Everything else comes from TheMealDB.
const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Miscellaneous" },
    area: { type: String, default: "" },
    image: { type: String, default: "" },
    instructions: { type: String, required: true },
    ingredients: [{ name: String, measure: String }],
    youtube: { type: String, default: "" },
    cookingTime: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", recipeSchema);
