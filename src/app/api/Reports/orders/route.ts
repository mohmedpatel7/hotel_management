import { NextRequest, NextResponse } from "next/server";
import Order from "@/lib/schema/Order";
import Weater from "@/lib/schema/Weater";
import { connectDB } from "@/lib/db/dbConnection";
import jwt, { JwtPayload } from "jsonwebtoken";

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

    const body = await req.json();
    const { from, to } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: "from and to body parameters are required" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO 8601 format." },
        { status: 400 }
      );
    }

    const orders = await Order.find({
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    })
      .populate({
        path: "foodId",
        select: "foodName",
      })
      .populate({
        path: "weaterId",
        select: "name",
      })
      .select("_id createdAt status foodId weaterId price tableNo")
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error",
      error: error,
      status: 500,
    });
  }
}
