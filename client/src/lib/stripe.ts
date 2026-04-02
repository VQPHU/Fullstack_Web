import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const stripePromise = loadStripe(stripePublishableKey);

export interface StripeCheckoutItem {
  name: string;
  description?: string;
  amount: number; 
  currency: string;
  quantity: number;
  images?: string[];
}

export interface CheckoutSessionRequest {
  items: StripeCheckoutItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

// 1. SỬA TẠI ĐÂY: Thêm url vào kiểu trả về của Promise
export const createCheckoutSession = async (
  data: CheckoutSessionRequest
): Promise<{ sessionId: string, url: string } | { error: string }> => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    // 2. SỬA TẠI ĐÂY: Lấy cả url từ Backend trả về
    const { sessionId, url } = await response.json();
    return { sessionId, url }; 
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Hàm này bạn viết đã đúng rồi, giữ nguyên
export const redirectToCheckout = (checkoutUrl: string) => {
  if (!checkoutUrl) {
    throw new Error("Checkout URL is missing");
  }
  window.location.href = checkoutUrl;
};