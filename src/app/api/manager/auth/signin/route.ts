import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/dbConnection";
import Manager from "@/lib/schema/Manager";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    connectDB();

    const { userId, password } = await req.json();
    if (!userId || !password) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "All fields are required !",
      });
    }

    const existUser = await Manager.findOne({ userId: userId });
    if (!existUser) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "User not found !",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, existUser.password);
    if (!isPasswordMatch) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "Invalid userid or password !",
      });
    }

    const manager_token = jwt.sign(
      { id: existUser._id },
      process.env.JWT_SIGN!,
      {
        expiresIn: "24h",
      }
    );

    return NextResponse.json({
      success: true,
      status: 200,
      message: "User signed in successfully !",
      manager_token,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 500,
      message: "Internal server error !",
      error,
    });
  }
}
