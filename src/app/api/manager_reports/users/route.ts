import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Weater from "@/lib/schema/Weater";
import Cook from "@/lib/schema/Cook";
import Manager from "@/lib/schema/Manager";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    connectDB();

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

    const weaters = await Weater.find({}).lean().select("-password");
    const cooks = await Cook.find({}).lean().select("-password");
    const managers = await Manager.find({}).lean().select("-password");

    return NextResponse.json({
      weaters,
      cooks,
      managers,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Failed to fetch users",
      error: error,
      status: 500,
    });
  }
}
