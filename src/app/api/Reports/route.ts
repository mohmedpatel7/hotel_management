import { NextRequest, NextResponse } from "next/server";
import Order from "@/lib/schema/Order";
import Table from "@/lib/schema/Table";
import Weater from "@/lib/schema/Weater";
import { connectDB } from "@/lib/db/dbConnection";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * API endpoint to generate reports based on date range
 *
 * Request body:
 * {
 *   fromDate: string (ISO date),
 *   toDate: string (ISO date)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     orders: Array<{
 *       _id: string,
 *       tableNo: number,
 *       status: "completed" | "cancelled" | "pending",
 *       price: number,
 *       foodId: { name: string, price: number },
 *       weaterId: { name: string }
 *     }>,
 *     tables: Array<{
 *       _id: string,
 *       number: number
 *     }>,
 *     waiters: Array<{
 *       _id: string,
 *       name: string
 *     }>,
 *     summary: {
 *       totalOrders: number,
 *       completedOrders: number,
 *       cancelledOrders: number,
 *       pendingOrders: number,
 *       totalRevenue: number
 *     }
 *   }
 * }
 */

//Genrate report api...
export async function POST(req: NextRequest) {
  try {
    connectDB();

    const token = req.headers.get("manager_token");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization Failed !" },
        { status: 400 }
      );
    }

    // ✅ Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get from and to dates from request body
    const { fromDate, toDate } = await req.json();

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: "From and To dates are required" },
        { status: 400 }
      );
    }

    // Create date range query
    const dateQuery = {
      createdAt: {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      },
    };

    // Fetch orders with populated food and waiter details
    const orders = await Order.find(dateQuery)
      .populate("foodId", "name price")
      .populate({
        path: "weaterId",
        model: Weater,
        select: "name",
      })
      .lean();

    // Get table details for orders
    const tableNumbers = [...new Set(orders.map((order) => order.tableNo))];
    const tables = await Table.find({
      number: { $in: tableNumbers },
    }).lean();

    // Get waiter details for orders
    const waiterIds = [...new Set(orders.map((order) => order.weaterId))];
    const waiters = await Weater.find({
      _id: { $in: waiterIds },
    })
      .select("name")
      .lean();

    // Calculate summary statistics
    const summary = {
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === "completed").length,
      cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      totalRevenue: orders
        .filter((o) => o.status === "completed")
        .reduce((sum, order) => sum + order.price, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        orders,
        tables,
        waiters,
        summary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate report", error: error },
      { status: 500 }
    );
  }
}
