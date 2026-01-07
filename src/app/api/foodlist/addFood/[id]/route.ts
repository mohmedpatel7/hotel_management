import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import FoodList from "@/lib/schema/FoodList";
import jwt, { JwtPayload } from "jsonwebtoken";
import { client } from "@/lib/Redis/client";

//Get details of perticular food..
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: foodId } = await params;
    //Setting up key
    const cacheKey = `food:${foodId}`;
    const cachedFood = await client.get(cacheKey);
    if (cachedFood) {
      return NextResponse.json(
        {
          message: "Food details fetched successfully!",
          food: cachedFood,
        },
        { status: 200 }
      );
    }

    connectDB();

    const food = await FoodList.findById({ _id: foodId });
    if (!food) {
      return NextResponse.json({ message: "Food not found!" }, { status: 404 });
    }
    //Setting up cache
    await client.set(cacheKey, JSON.stringify(food), {
      ex: 1200,
    });

    return NextResponse.json(
      { message: "Food details fetched successfully!", food },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error!", error: error },
      { status: 500 }
    );
  }
}

//update food status..
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    connectDB();

    const token = req.headers.get("cook_token");
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

    const { id: foodId } = await params;

    const { status } = await req.json();
    if (!status) {
      return NextResponse.json(
        { message: "Status is required!" },
        { status: 400 }
      );
    }
    if (status !== "available" && status !== "unavailable") {
      return NextResponse.json({ message: "Invalid status!" }, { status: 400 });
    }

    const food = await FoodList.findByIdAndUpdate(
      { _id: foodId },
      { status: status }
    );
    if (!food) {
      return NextResponse.json({ message: "Food not found!" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Food status updated successfully!", food },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error!", error: error },
      { status: 500 }
    );
  }
}
