import mongoose from "mongoose";

const ManagerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Manager ||
  mongoose.model("Manager", ManagerSchema);
