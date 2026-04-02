import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, successUrl, cancelUrl, customerEmail, metadata } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    const lineItems = items.map(
      (item: {
        name: string;
        description?: string;
        amount: number;
        currency: string;
        quantity: number;
        images?: string[];
      }) => ({
        price_data: {
          currency: item.currency || "usd",
          product_data: {
            name: item.name,
            ...(item.description && { description: item.description }),
            ...(item.images && item.images.length > 0 && { images: item.images }),
          },
          unit_amount: item.amount, // already in cents
        },
        quantity: item.quantity,
      })
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      ...(metadata && { metadata }),
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}