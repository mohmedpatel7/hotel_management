import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import FoodList from "@/lib/schema/FoodList";
import cloudinary from "@/utils/cloudinary";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = req.headers.get("manager_token");
    if (!token) {
      return NextResponse.json({
        message: "Authorization Failed !",
        success: false,
        status: 400,
      });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const foodId = id;

    const formData = await req.formData();

    const type = formData.get("type") as string | null;
    const category = formData.get("category") as string | null;
    const foodName = formData.get("foodName") as string | null;
    const halfPrice = formData.get("halfPrice") as string | null;
    const fullPrice = formData.get("fullPrice") as string | null;
    const file = formData.get("foodImage") as File | null;

    const updateFields: Partial<{
      type?: string;
      category?: string;
      foodName?: string;
      halfPrice?: string;
      fullPrice?: string;
      foodImage?: string;
    }> = {};

    if (type) updateFields.type = type;
    if (category) updateFields.category = category;
    if (foodName) updateFields.foodName = foodName;
    if (halfPrice !== null) updateFields.halfPrice = halfPrice;
    if (fullPrice) updateFields.fullPrice = fullPrice;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64File = `data:${file.type};base64,${buffer.toString(
        "base64"
      )}`;
      const uploadResponse = await cloudinary.uploader.upload(base64File, {
        folder: "food_images",
      });
      updateFields.foodImage = uploadResponse.secure_url;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({
        message: "No fields to update",
        status: 400,
        success: false,
      });
    }

    const updatedFood = await FoodList.findByIdAndUpdate(foodId, updateFields, {
      new: true,
    });
    if (!updatedFood) {
      return NextResponse.json({ message: "Food not found!" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Food info updated successfully!",
      status: 200,
      success: true,
      updatedFood,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Delete a food item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    connectDB();

    const token = req.headers.get("manager_token");
    if (!token) {
      return NextResponse.json({
        message: "Authorization Failed !",
        success: false,
        status: 400,
      });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const foodId = id;
    const deletedFood = await FoodList.findByIdAndDelete(foodId);
    if (!deletedFood) {
      return NextResponse.json({ message: "Food not found!" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Food item deleted successfully!",
      status: 200,
      success: true,
      deletedFood,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
