import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import FoodList from "@/lib/schema/FoodList";
import jwt, { JwtPayload } from "jsonwebtoken";

//update food price...
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    connectDB();

    const token = req.headers.get("cook_token");
    if (!token) {
      return NextResponse.json({
        message: "Authorization Failed !",
        success: false,
        status: 400,
      });
    }

    // ✅ Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const foodId = params.id;

    const { halfPrice, fullPrice } = await req.json();
    if (!halfPrice || !fullPrice) {
      return NextResponse.json({
        message: "Price is required!",
        status: 400,
        success: false,
      });
    }

    const updatePrice = await FoodList.findByIdAndUpdate(
      foodId,
      {
        halfPrice,
        fullPrice,
      },
      { new: true }
    );
    if (!updatePrice) {
      return NextResponse.json({ message: "Food not found!" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Price updated successfully!",
      status: 200,
      success: true,
      updatePrice,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
      success: false,
      error,
    });
  }
}
