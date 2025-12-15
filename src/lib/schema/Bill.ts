import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
  billId: { type: String, required: true, unique: true },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true,
  },
  orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  totalAmount: { type: Number, default: 0 }, // Initially 0
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "completed", "cancelled"],
  }, // pending, completed, cancelled
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
