import mongoose from "mongoose";

const FoodListSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    halfPrice: {
      type: String,
    },
    fullPrice: {
      type: String,
      required: true,
    },
    foodImage: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "available",
      enum: ["available", "unavailable"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Food || mongoose.model("Food", FoodListSchema);
