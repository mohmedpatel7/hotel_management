import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import FoodList from "@/lib/schema/FoodList";
import cloudinary from "@/utils/cloudinary";
import jwt, { JwtPayload } from "jsonwebtoken";

//update food info...
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // ✅ Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const foodId = params.id;

    const formData = await req.formData();
    const type = formData.get("type") as string | null;
    const category = formData.get("category") as string | null;
    const foodName = formData.get("foodName") as string | null;
    const halfPrice = formData.get("halfPrice") as string | null;
    const fullPrice = formData.get("fullPrice") as string | null;
    const file = formData.get("foodImage") as File | null;

    if (!type || !category || !foodName || !fullPrice) {
      return NextResponse.json({
        message: "Please fill all the required fields !",
        status: 400,
        success: false,
      });
    }

    interface UpdateFields {
      type: string;
      category: string;
      foodName: string;
      halfPrice?: string | null;
      fullPrice: string;
      foodImage?: string;
    }

    const updateFields: UpdateFields = {
      type,
      category,
      foodName,
      halfPrice,
      fullPrice,
    };

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
