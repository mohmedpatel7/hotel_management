import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import bcrypt from "bcryptjs";
import Cook from "@/lib/schema/Cook";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    connectDB();

    const token = req.headers.get("manager_token");
    if (!token) {
      return NextResponse.json({
        success: false,
        status: 401,
        message: "Unauthorized !",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SIGN!);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        status: 401,
        message: "Unauthorized !",
      });
    }

    const { name, userId, password } = await req.json();
    if (!name || !userId || !password) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "Please fill all the fields !",
      });
    }

    const user = await Cook.findOne({ userId });
    if (user) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "User already exists !",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Cook({
      name,
      userId,
      password: hashedPassword,
    });
    await newUser.save();

    const cook_token = jwt.sign(
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
      cook_token,
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
