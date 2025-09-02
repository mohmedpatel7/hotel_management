import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Order from "@/lib/schema/Order";
import Food from "@/lib/schema/FoodList";
import Weater from "@/lib/schema/Weater";
import Table from "@/lib/schema/Table";

//Place order api
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { foodId, quntity, weaterId, tableNo } = body;

    // ✅ Basic validation
    if (!foodId || !quntity || !weaterId || !tableNo) {
      return NextResponse.json({
        message: "All fields are required!",
        status: 400,
        success: false,
      });
    }

    if (!["half", "full"].includes(quntity)) {
      return NextResponse.json({
        message: "Quantity must be either 'half' or 'full'",
        status: 400,
        success: false,
      });
    }

    // ✅ Check food exists & available
    const food = await Food.findById(foodId);
    if (!food) {
      return NextResponse.json({ message: "Food not found!" }, { status: 404 });
    }
    if (food.status === "unavailable") {
      return NextResponse.json({
        message: "Selected food is unavailable!",
        status: 400,
        success: false,
      });
    }

    // ✅ Determine price based on quantity
    let price: number;
    if (quntity === "half") {
      if (!food.halfPrice) {
        return NextResponse.json({
          message: "Half price not available for this food!",
          status: 400,
          success: false,
        });
      }
      price = Number(food.halfPrice);
    } else {
      price = Number(food.fullPrice);
    }

    // ✅ Check waiter
    const waiter = await Weater.findById(weaterId);
    if (!waiter) {
      return NextResponse.json({
        message: "Waiter not found!",
        status: 404,
        success: false,
      });
    }

    // ✅ Check table availability
    const table = await Table.findOne({ number: tableNo });
    if (!table) {
      return NextResponse.json({
        message: "Table not found!",
        status: 404,
        success: false,
      });
    }
    if (table.status === "booked") {
      return NextResponse.json({
        message: `Table ${tableNo} is already booked!`,
        status: 400,
        success: false,
      });
    }

    // ✅ Create order with calculated price
    const newOrder = await Order.create({
      foodId,
      quntity,
      price,
      weaterId,
      tableNo,
      status: "pending",
    });

    // ✅ Update table status
    table.status = "booked";
    await table.save();

    return NextResponse.json({
      message: "Order placed successfully!",
      order: newOrder,
      success: true,
      status: 201,
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

//Fetch all orders...
export async function GET() {
  try {
    connectDB();

    const orders = await Order.find().populate("foodId weaterId tableNo");
    if (!orders) {
      return NextResponse.json({
        message: "No orders found!",
        status: 404,
        success: false,
      });
    }

    const response = orders.map((order) => ({
      ...order._doc,
      foodName: order.foodId.name,
      weaterName: order.weaterId.name,
      tableNumber: order.tableNo,
      status: order.status,
      quntity: order.quntity,
      price: order.price,
    }));

    return NextResponse.json({
      message: "Orders fetched successfully!",
      response,
      success: true,
      status: 200,
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
