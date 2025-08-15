import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Table || mongoose.model("Table", TableSchema);
