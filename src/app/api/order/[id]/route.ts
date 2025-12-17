import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Order from "@/lib/schema/Order";

// get the particular order details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({
        message: "Order not found",
        status: 404,
        success: false,
      });
    }

    const response = {
      _id: order._id,
      foodId: order.foodId,
      quntity: order.quntity,
      price: order.price,
      weaterId: order.weaterId,
      tableNo: order.tableNo,
      status: order.status,
    };

    return NextResponse.json({
      message: "Order fetched successfully",
      response,
      status: 200,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error",
      error,
      status: 500,
      success: false,
    });
  }
}

//update the order status...
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({
        message: "Order not found",
        status: 404,
        success: false,
      });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({
        message: "Status is required",
        status: 400,
        success: false,
      });
    }
    if (
      status !== "pending" &&
      status !== "completed" &&
      status !== "cancelled"
    ) {
      return NextResponse.json({
        message: "Invalid status",
        status: 400,
        success: false,
      });
    }

    order.status = status;
    await order.save();

    return NextResponse.json({
      message: "Order status updated successfully",
      status: 200,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error",
      error,
      status: 500,
      success: false,
    });
  }
}
