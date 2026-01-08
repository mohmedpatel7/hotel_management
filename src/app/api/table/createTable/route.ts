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
        }
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

//Get table detailes...
export async function GET() {
  try {
    const cacheKey = "tables:all";

    // 1️⃣ Check Redis FIRST
    const cachedTables = await client.get(cacheKey);
    if (cachedTables) {
      return NextResponse.json({
        message: "Tables fetched successfully",
        tables: cachedTables,
        status: 200,
        success: true,
        source: "redis",
      });
    }

    connectDB();

    // 2️⃣ Fetch from MongoDB
    const tables = await Table.find();

    if (tables.length === 0) {
      return NextResponse.json(
        {
          message: "No tables found",
          status: 404,
          success: false,
          tables: [],
        },
        { status: 404 }
      );
    }

    const tableDetails = tables.map((table) => ({
      _id: table._id,
      status: table.status,
      number: table.number,
    }));

    // 3️⃣ Store in Redis (TTL 40 sec)
    await client.set(cacheKey, tableDetails, { ex: 40 });

    return NextResponse.json({
      message: "Tables fetched successfully",
      tables: tableDetails,
      status: 200,
      success: true,
      source: "mongodb",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error!",
        status: 500,
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
}
