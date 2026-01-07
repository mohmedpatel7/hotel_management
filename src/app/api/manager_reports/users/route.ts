import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Weater from "@/lib/schema/Weater";
import Cook from "@/lib/schema/Cook";
import Manager from "@/lib/schema/Manager";
import jwt, { JwtPayload } from "jsonwebtoken";
import { client } from "@/lib/Redis/client";

export async function GET(req: Request) {
  try {
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

    //Settin up keys for users.
    const weaterKey = `weaters:all`;
    const cookkey = `cooks:all`;
    const managerKey = `managers:all`;

    //1. Check cache first.
    const cachedWeaters = await client.get(weaterKey);
    const cachedCooks = await client.get(cookkey);
    const cachedManagers = await client.get(managerKey);

    if (cachedWeaters && cachedCooks && cachedManagers) {
      return NextResponse.json({
        weaters: cachedWeaters,
        cooks: cachedCooks,
        managers: cachedManagers,
      });
    }

    connectDB();

    const weaters = await Weater.find({}).lean().select("-password");
    const cooks = await Cook.find({}).lean().select("-password");
    const managers = await Manager.find({}).lean().select("-password");

    //2. Storing on redis.
    await client.set(weaterKey, weaters, { ex: 1800 });
    await client.set(cookkey, cooks, { ex: 1800 });
    await client.set(managerKey, managers, { ex: 1800 });

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
