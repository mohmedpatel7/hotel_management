import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/lib/schema/Order";
import { connectDB } from "@/lib/db/dbConnection";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * POST /api/reports/revenue
 * Body: { from: string, to: string }  // ISO 8601 date strings
 * Response samples:
 * 200 OK
 * {
 *   "totalRevenue": 125000
 * }
 *
 * 400 Bad Request
 * {
 *   "error": "from and to are required in body"
 * }
 * or
 * {
 *   "error": "Invalid date format. Use ISO 8601 strings."
 * }
 *
 * 500 Internal Server Error
 * {
 *   "message": "Internal server error",
 *   "error": <details>
 * }
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
        { error: "from and to are required in body" },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO 8601 strings." },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fromDate,
            $lte: toDate,
          },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    return NextResponse.json(
      { totalRevenue: totalRevenue[0]?.total ?? 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      error: error,
      status: 500,
    });
  }
}
