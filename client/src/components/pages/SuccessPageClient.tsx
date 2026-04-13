"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/container";
import { useCartStore } from "@/lib/store";
import { fetchData } from "@/lib/api";

const SuccessPageClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCartStore();

    const hasCalledAPI = useRef(false);
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        const confirmPaymentAndClearCart = async () => {
            if (orderId && sessionId && !hasCalledAPI.current) {
                try {
                    hasCalledAPI.current = true;
                    const userInfo =
                        typeof window !== "undefined"
                            ? JSON.parse(localStorage.getItem("userInfo") || "{}")
                            : {};
                    const token = userInfo?.token;

                    await fetchData(
                        `/orders/${orderId}/webhook-status`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                status: "paid",
                                stripeSessionId: sessionId,
                            }),
                        }
                    );

                    console.log("Payment successful & DB updated");
                    clearCart();
                } catch (error) {
                    console.error("Error updating order after payment:", error);
                    hasCalledAPI.current = false;
                }
            }
        };

        confirmPaymentAndClearCart();
    }, [orderId, sessionId, clearCart]);

    return (
        <Container className="min-h-[70vh] flex items-center justify-center py-12">
            <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                        <div className="relative bg-green-50 p-4 rounded-full">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your order{" "}
                    <span className="font-mono font-bold text-blue-600">
                        #{orderId?.slice(-6).toUpperCase()}
                    </span>{" "}
                    is being processed for shipping.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => router.push("/user/orders")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-medium transition-all"
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        View My Orders
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="w-full text-gray-500 hover:text-gray-900"
                    >
                        Continue Shopping
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                        The system is updating your order status...
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default SuccessPageClient;