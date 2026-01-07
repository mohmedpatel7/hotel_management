import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import bcrypt from "bcryptjs";
import Weater from "@/lib/schema/Weater";
import jwt, { JwtPayload } from "jsonwebtoken";
import { client } from "@/lib/Redis/client";

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

    const user = await Weater.findOne({ userId });
    if (user) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "User already exists !",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Weater({
      name,
      userId,
      password: hashedPassword,
    });
    await newUser.save();

    const weater_token = jwt.sign(
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
      weater_token,
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

//Get weater profile...
export async function GET(req: NextRequest) {
  try {
    connectDB();

    const token = req.headers.get("weater_token");
    if (!token) {
      return NextResponse.json({
        success: false,
        status: 401,
        message: "Unauthorized !",
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
    const weaterCache = `weater:${userId}`;

    //1. Check cache first.
    const cacheWaiter = await client.get(weaterCache);
    if (cacheWaiter) {
      return NextResponse.json({
        success: true,
        status: 200,
        message: "Weater profile fetched successfully !",
        response: cacheWaiter,
        source: "redis",
      });
    }

    const weater = await Weater.findById({ _id: userId }).select("-password");
    if (!weater) {
      return NextResponse.json({
        success: false,
        status: 404,
        message: "Weater not found !",
      });
    }

    const response = {
      name: weater.name,
      userId: weater.userId,
    };

    //2. Store in redis cache.
    await client.set(weaterCache, response, { ex: 3600 });

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Weater profile fetched successfully !",
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
