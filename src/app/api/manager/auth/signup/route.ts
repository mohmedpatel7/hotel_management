import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { client } from "@/lib/Redis/client";

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

// Get manager profile
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("manager_token");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authorization Failed !" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const cacheKey = `manager:${userId}`;

    // 1️⃣ CHECK REDIS FIRST
    const cachedManager = await client.get(cacheKey);
    if (cachedManager) {
      return NextResponse.json({
        success: true,
        status: 200,
        message: "Manager profile fetched successfully !",
        response: cachedManager,
        source: "redis",
      });
    }

    connectDB();

    // 2️⃣ FETCH FROM MONGODB
    const manager = await Manager.findById(userId).select("-password");
    if (!manager) {
      return NextResponse.json(
        { success: false, message: "Manager not found!" },
        { status: 404 }
      );
    }

    const response = {
      name: manager.name,
      userId: manager.userId,
    };

    // 3️⃣ STORE IN REDIS (TTL 5 min)
    await client.set(cacheKey, response, { ex: 3600 });

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Manager profile fetched successfully !",
      response,
      source: "mongodb",
    });
  } catch (error) {
    console.error("Error fetching manager profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error !",
        error: error,
      },
      { status: 500 }
    );
  }
}
