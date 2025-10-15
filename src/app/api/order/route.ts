import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Order from "@/lib/schema/Order";
import Food from "@/lib/schema/FoodList";
import Weater from "@/lib/schema/Weater";
import Table from "@/lib/schema/Table";
import Bill from "@/lib/schema/Bill";
import jwt, { JwtPayload } from "jsonwebtoken";

async function generateUniqueBillId() {
  let billId;
  let exists = true;

  while (exists) {
    billId = "BILL-" + Math.floor(100000 + Math.random() * 900000);
    exists = (await Bill.findOne({ billId })) !== null;
  }

  return billId;
}

// Place order API
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get("weater_token");
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

    // ✅ Determine price
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

    // ✅ Check table
    const table = await Table.findOne({ number: tableNo });
    if (!table) {
      return NextResponse.json({
        message: "Table not found!",
        status: 404,
        success: false,
      });
    }

    // ✅ Create order
    const newOrder = await Order.create({
      foodId,
      quntity,
      price,
      weaterId,
      tableNo,
      status: "pending",
    });

    // ✅ Ensure table is booked
    if (table.status !== "booked") {
      table.status = "booked";
      await table.save();
    }

    // ✅ Find active bill for this table
    let bill = await Bill.findOne({ tableId: table._id }).sort({
      createdAt: -1,
    }); // latest bill
    if (!bill) {
      // In case no bill exists (failsafe) → create one
      const billId = await generateUniqueBillId();
      bill = new Bill({
        billId,
        tableId: table._id,
        orderIds: [],
        totalAmount: 0,
      });
    }

    // ✅ Attach new order to bill
    bill.orderIds.push(newOrder._id);

    // ✅ Update bill total
    bill.totalAmount += price;

    await bill.save();

    return NextResponse.json({
      message: "Order placed successfully and added to bill!",
      order: newOrder,
      bill,
      success: true,
      status: 201,
    });
  } catch (error) {
    console.error(error);
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
