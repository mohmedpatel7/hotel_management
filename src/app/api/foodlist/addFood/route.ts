import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import FoodList from "@/lib/schema/FoodList";
import cloudinary from "@/utils/cloudinary";
import jwt, { JwtPayload } from "jsonwebtoken";
import { client } from "@/lib/Redis/client";

export async function POST(req: NextRequest) {
  try {
    connectDB(); // ✅ ensure DB connection

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

    // ✅ Parse multipart form-data
    const formData = await req.formData();
    const type = formData.get("type") as string | null;
    const category = formData.get("category") as string | null;
    const foodName = formData.get("foodName") as string | null;
    const halfPrice = formData.get("halfPrice") as string | null;
    const fullPrice = formData.get("fullPrice") as string | null;
    const file = formData.get("foodImage") as File | null;

    if (!type || !category || !foodName || !fullPrice || !file) {
      return NextResponse.json(
        { message: "Please fill all the required fields !" },
        { status: 400 }
      );
    }

    // ✅ Convert File to Base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // ✅ Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: "food_images",
    });

    // ✅ Save in DB
    const newFoodItem = await FoodList.create({
      type,
      category,
      foodName,
      halfPrice,
      fullPrice,
      foodImage: uploadResponse.secure_url,
    });

    return NextResponse.json(
      {
        message: "Food item added successfully!",
        newFoodItem,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error!", error: error },
      { status: 500 }
    );
  }
}

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

    const foodList = await FoodList.find();
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
