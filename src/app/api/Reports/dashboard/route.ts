import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Order from "@/lib/schema/Order";
import Cook from "@/lib/schema/Cook";
import Weater from "@/lib/schema/Weater";
import Food from "@/lib/schema/FoodList";

export async function GET() {
  try {
    await connectDB();

    // Calculate last 30 days
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    // Today's orders count
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const todaysOrdersCount = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    // Monthly Revenue: sum of completed orders in last 30 days
    const orders = await Order.find({
      status: "completed",
      createdAt: { $gte: lastMonth, $lte: today },
    }).lean();
    const monthlyRevenue = orders.reduce(
      (sum, order) => sum + (order.price || 0),
      0
    );

    // Total Waiters
    const totalWaiters = await Weater.countDocuments();

    // Total Cooks
    const totalCooks = await Cook.countDocuments();

    // Famous Foods (top 6 by order count in last 30 days)
    const foodOrderCounts = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: lastMonth, $lte: today },
        },
      },
      { $group: { _id: "$foodId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Bulk-fetch foods to avoid N+1 queries
    const foodIds = foodOrderCounts.map((item) => item._id);
    const foods = await Food.find({ _id: { $in: foodIds } }).lean();
    const foodMap = new Map(foods.map((f) => [String(f._id), f]));

    const famousFoods = foodOrderCounts.map((item) => {
      const food = foodMap.get(String(item._id));
      return {
        name: food?.foodName || "Unknown",
        price: food?.fullPrice ?? "N/A",
        orders: `${item.count}+ orders`,
      };
    });

    return NextResponse.json({
      monthlyRevenue,
      todaysOrdersCount,
      totalWaiters,
      totalCooks,
      famousFoods,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to connect to database", status: 500, error: error },
      { status: 500 }
    );
  }
}
