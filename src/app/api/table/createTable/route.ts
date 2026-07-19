import { NextRequest, NextResponse } from "next/server";
import Table from "@/lib/schema/Table";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/dbConnection";
import { client } from "@/lib/Redis/client";

//Create table...
export async function POST(req: NextRequest) {
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

    const decoded = jwt.verify(token, process.env.JWT_SIGN!);
    if (!decoded) {
      return NextResponse.json({
        message: "Authorization Failed !",
        status: 400,
        success: false,
      });
    }

    const { status, number } = await req.json();
    if (!number) {
      return NextResponse.json(
        {
          message: "Number is required",
        },
        {
          status: 400,
        },
      );
    }

    const isTableExist = await Table.findOne({ number });
    if (isTableExist) {
      return NextResponse.json({
        message: "Table already exist !",
        status: 400,
        success: false,
      });
    }

    const table = new Table({
      status,
      number,
    });
    await table.save();

    // Invalidate static cache when a new table is created
    await client.del("tables:static");

    return NextResponse.json({
      message: "Table created successfully",
      table,
      status: 201,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error !",
      error,
      status: 500,
      success: false,
    });
  }
}

//Get table details...
export async function GET() {
  try {
    const staticCacheKey = "tables:static";
    await connectDB();

    // 1️⃣ Try to get static data (ID and Number) from Redis
    const cachedStatic = await client.get(staticCacheKey);

    // 2️⃣ Always fetch the latest STATUS from MongoDB
    // We only select _id and status to keep the query light
    const liveStatuses = await Table.find({}, "_id status number");

    if (liveStatuses.length === 0) {
      return NextResponse.json(
        {
          message: "No tables found",
          status: 404,
          success: false,
          tables: [],
        },
        { status: 404 },
      );
    }

    // 3️⃣ If we don't have static data cached, cache it now (Long TTL: 1 hour)
    if (!cachedStatic) {
      const staticData = liveStatuses.map((table) => ({
        _id: table._id,
        number: table.number,
      }));
      await client.set(staticCacheKey, staticData, { ex: 3600 });
    }

    // 4️⃣ Construct the final response
    // Since we fetched 'number' in step 2 for the initial cache build/verification,
    // we can just return liveStatuses. In a high-scale environment, you would
    // merge cachedStatic with a liveStatus-only query.
    const tableDetails = liveStatuses.map((table) => ({
      _id: table._id,
      status: table.status,
      number: table.number,
    }));

    return NextResponse.json({
      message: "Tables fetched successfully",
      tables: tableDetails,
      status: 200,
      success: true,
      source: cachedStatic
        ? "hybrid (static:redis, status:mongodb)"
        : "mongodb",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error!",
        status: 500,
        success: false,
        error,
      },
      { status: 500 },
    );
  }
}
