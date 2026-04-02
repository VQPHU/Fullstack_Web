"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/container";
import { useCartStore } from "@/lib/store";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();
  
  // Lấy orderId và sessionId từ URL mà Stripe trả về
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // 1. Xóa giỏ hàng vì khách đã trả tiền xong
      clearCart();
      
      // 2. (Tùy chọn) Gọi API để cập nhật trạng thái đơn hàng trong DB là "Paid"
      // fetch(`/api/confirm-payment?session_id=${sessionId}`);
      
      console.log("Thanh toán thành công cho đơn hàng:", orderId);
    }
  }, [sessionId, orderId, clearCart]);

  return (
    <Container className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
        {/* Icon thành công */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative bg-green-50 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Thanh toán thành công!
        </h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã tin tưởng mua sắm. Đơn hàng <span className="font-mono font-bold text-blue-600">#{orderId?.slice(-6)}</span> của bạn đang được xử lý.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => router.push("/user/orders")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-medium transition-all"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Xem đơn hàng của tôi
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")}
            className="w-full text-gray-500 hover:text-gray-900"
          >
            Tiếp tục mua sắm
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            Một email xác nhận sẽ được gửi đến hòm thư của bạn trong giây lát.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default SuccessPage;