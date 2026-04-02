import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  try {
    // Hỏi Stripe xem cái session này thực sự đã trả tiền chưa
    const session = await stripe.checkout.sessions.retrieve(sessionId!);

    if (session.payment_status === "paid") {
      // Ở ĐÂY: Bạn viết code để cập nhật Database (Ví dụ: order.status = 'paid')
      return NextResponse.json({ paid: true });
    }
    
    return NextResponse.json({ paid: false });
  } catch (err) {
    return NextResponse.json({ error: "Lỗi kiểm tra" }, { status: 500 });
  }
}