import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Order from "@/lib/schema/Order";

//get the perticular order details...
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const order = await Order.findById(params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({
        message: "Order not found",
        status: 404,
        success: false,
      });
    }

    const { status } = await req.json();

    order.status = status;
    await order.save();
  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error",
      error,
      status: 500,
      success: false,
    });
  }
}
