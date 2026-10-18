import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mealId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

favouriteSchema.index({ user: 1, mealId: 1 }, { unique: true });

export default mongoose.model("Favourite", favouriteSchema);
