import mongoose from "mongoose";

const CookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Cook || mongoose.model("Cook", CookSchema);
