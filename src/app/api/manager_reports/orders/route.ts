import { NextRequest, NextResponse } from "next/server";
import Order from "@/lib/schema/Order";
import Food from "@/lib/schema/FoodList";
import Weater from "@/lib/schema/Weater";
import { connectDB } from "@/lib/db/dbConnection";
import jwt from "jsonwebtoken";

/**
 * POST /api/reports/orders
 * Returns a list of orders created between the given `from` and `to` dates.
 *
 * Request body: { from: string, to: string }  // ISO 8601 date strings
 *
 * Success response (200):
 * {
 *   orders: [
 *     {
 *       _id: string,
 *       createdAt: string,
 *       foodId: {
 *         foodName: string
 *       },
 *       weaterId: {
 *         name: string
 *       },
 *       status: string,
 *       ...other order fields
 *     },
 *     ...
 *   ]
 * }
 *
 * Error responses:
 * 400 – Missing or invalid date parameters
 * 500 – Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ Always await DB
    await connectDB();

    // 🔐 Auth
    const token = req.headers.get("manager_token");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization Failed !" },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SIGN) {
      return NextResponse.json(
        { message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SIGN);
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 📦 Body
    const { from, to } = await req.json();

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to are required" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // 📄 1️⃣ Fetch orders
    const orders = await Order.find({
      createdAt: { $gte: fromDate, $lte: toDate },
    }).lean();

    if (!orders.length) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    // 📄 2️⃣ Collect IDs
    const foodIds = [...new Set(orders.map((o) => o.foodId?.toString()))];
    const weaterIds = [...new Set(orders.map((o) => o.weaterId?.toString()))];

    // 📄 3️⃣ Fetch related collections
    const foods = await Food.find({ _id: { $in: foodIds } })
      .select("foodName fullPrice")
      .lean();

    const weaters = await Weater.find({ _id: { $in: weaterIds } })
      .select("name")
      .lean();

    // 📄 4️⃣ Map for fast lookup
    const foodMap = Object.fromEntries(
      foods.map((f) => [(f._id as string).toString(), f])
    );

    const weaterMap = Object.fromEntries(
      weaters.map((w) => [(w._id as string).toString(), w])
    );

    // 📄 5️⃣ Merge data
    const result = orders.map((order) => ({
      _id: order._id,
      tableNo: order.tableNo,
      status: order.status,
      price: order.price,
      quantity: order.quntity,
      createdAt: order.createdAt,

      food: foodMap[order.foodId?.toString()] || null,
      weater: weaterMap[order.weaterId?.toString()] || null,
    }));

    return NextResponse.json({ orders: result }, { status: 200 });
  } catch (error) {
    console.error("Order filter error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
