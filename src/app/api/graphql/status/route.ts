import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/dbConnection";
import Bill from "@/lib/schema/Bill";
import jwt, { JwtPayload } from "jsonwebtoken";

//Update bill status...
export async function PUT(req: NextRequest) {
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

    // ✅ Parse request body
    const { billId, status } = await req.json();
    if (!billId || !status) {
      return NextResponse.json(
        { message: "Please fill all the required fields !" },
        { status: 400 }
      );
    }
    // ✅ Update bill status
    const bill = await Bill.findOneAndUpdate({ billId: billId }, { status });
    if (!bill) {
      return NextResponse.json(
        { message: "Bill not found !" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Bill status updated successfully !" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error !" },
      { status: 500 }
    );
  }
}
