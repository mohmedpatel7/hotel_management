import { NextRequest, NextResponse } from "next/server";
import Table from "@/lib/schema/Table";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/dbConnection";

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
    connectDB();
    const tables = await Table.find();
    if (!tables) {
      return NextResponse.json({
        message: "No tables found",
        status: 404,
        success: false,
        tables,
      });
    }

    return NextResponse.json({
      message: "Tables fetched successfully",
      tables,
      status: 200,
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
