import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: true,
  },
  quntity: {
    type: String,
    required: true,
    enum: ["half", "full"],
  },
  price: {
    type: Number,
    required: true,
  },
  weaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Weater",
    required: true,
  },
  tableNo: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "cancelled"],
  },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
