import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import bcrypt from "bcryptjs";
import Cook from "@/lib/schema/Cook";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    connectDB();

    const { userId, password } = await req.json();
    if (!userId || !password) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "Please fill all the fields !",
      });
    }

    const user = await Cook.findOne({ userId });
    if (!user) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "User not found !",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "Incorrect userId or password !",
      });
    }

    const cook_token = jwt.sign({ id: user._id, role: 'cook' }, process.env.JWT_SIGN!, {
      expiresIn: "24h",
    });

    return NextResponse.json({
      success: true,
      status: 200,
      message: "User signed in successfully !",
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
