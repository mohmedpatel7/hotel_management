import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

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

//Get manager profile...
export async function GET(req: NextRequest) {
  try {
    connectDB();

    const token = req.headers.get("manager_token");
    if (!token) {
      return NextResponse.json({
        message: "Authorization Failed !",
        status: 400,
        success: false,
      });
    }

    // Verify the token and extract user id
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = decoded.id;
    const manager = await Manager.findById({ _id: userId }).select("-password");

    if (!manager) {
      return NextResponse.json(
        { message: "Manager not found!" },
        { status: 404 }
      );
    }

    const response = {
      name: manager.name,
      userId: manager.userId,
    };

    console.log(response);

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Manager profile fetched successfully !",
      response,
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
