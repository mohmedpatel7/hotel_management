import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import FoodList from "@/lib/schema/FoodList";
import { client } from "@/lib/Redis/client";

// ✅ Get food list
export async function GET() {
  try {
    const foodKey = "foodList:all";
    // 1.Check Cache first.
    const foodListCache = await client.get(foodKey);
    if (foodListCache) {
      return NextResponse.json({
        success: true,
        status: 200,
        message: "Food list fetched successfully !",
        foodItems: foodListCache,
        source: "redis",
      });
    }

    connectDB();

    const foodList = await FoodList.find({ status: "available" });
    if (!foodList || foodList.length === 0) {
      return NextResponse.json(
        { message: "No food items found !" },
        { status: 404 }
      );
    }

    // Map the array of food items to include all fields
    const response = foodList.map((item) => ({
      id: item._id,
      type: item.type,
      category: item.category,
      foodName: item.foodName,
      halfPrice: item.halfPrice,
      fullPrice: item.fullPrice,
      foodImage: item.foodImage,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // 2. Store in redis cache.
    await client.set(foodKey, response, { ex: 1200 });

    return NextResponse.json({ foodItems: response }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error!", error: error },
      { status: 500 }
    );
  }
}
