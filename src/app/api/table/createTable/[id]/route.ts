import { NextRequest, NextResponse } from "next/server";
import Table from "@/lib/schema/Table";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/dbConnection";
import Bill from "@/lib/schema/Bill";

async function generateUniqueBillId() {
  let billId;
  let exists = true;

  while (exists) {
    billId = "BILL-" + Math.floor(100000 + Math.random() * 900000);
    exists = (await Bill.findOne({ billId })) !== null;
  }

  return billId;
}

//To update table status...
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    connectDB();
    const token = req.headers.get("weater_token");
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

    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({
        message: "Status is required",
        status: 400,
        success: false,
      });
    }

    // Validate that status is either 'available' or 'booked'
    if (status !== "available" && status !== "booked") {
      return NextResponse.json({
        message: "Status must be either 'available' or 'booked'",
        status: 400,
        success: false,
      });
    }

    const { id } = await params;
    const table = await Table.findByIdAndUpdate(id, { status: status });

    if (!table) {
      return NextResponse.json({
        message: "Table not found",
        status: 404,
        success: false,
      });
    }

    let bill = null;

    // Auto-generate bill only when booking
    if (status === "booked") {
      const billId = await generateUniqueBillId();

      bill = new Bill({
        billId,
        tableId: table._id,
        orderIds: [], // initially empty, orders will be added later
        totalAmount: 0,
      });

      await bill.save();
    }

    return NextResponse.json({
      message: `Table status updated to ${status}`,
      status: 200,
      success: true,
      table,
      bill: bill || null, // send bill details only if created
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error",
      status: 500,
      success: false,
      error,
    });
  }
}

//To delete table...
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const table = await Table.findByIdAndDelete(id);
    if (!table) {
      return NextResponse.json({
        message: "Table not found !",
        status: 404,
        success: false,
      });
    }
    return NextResponse.json({
      message: "Table deleted successfully",
      status: 200,
      success: true,
      table,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error !",
      status: 500,
      success: false,
      error,
    });
  }
}
