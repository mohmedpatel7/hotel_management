import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/dbConnection";
import Manager from "@/lib/schema/Manager";

export async function POST(req: NextRequest) {
  try {
    connectDB();

    const { name, userId, password } = await req.json();

    if (!name || !userId || !password) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "All fields are required !",
      });
    }

    const existUser = await Manager.findOne({ userId: userId });
    if (existUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists !",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Manager({
      name,
      userId,
      password: hashedPassword,
    });
    await newUser.save();

    const manager_token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SIGN!,
      {
        expiresIn: "24h",
      }
    );

    return NextResponse.json({
      success: true,
      status: 201,
      message: "User created successfully !",
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
