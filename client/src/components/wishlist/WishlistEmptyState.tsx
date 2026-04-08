"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WishlistEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="text-gray-300">
        <Heart size={72} strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          Your wishlist is empty
        </h3>
        <p className="text-gray-400 text-sm">
          Start adding items to your wishlist by clicking the heart icon on
          products you love
        </p>
      </div>
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors cursor-pointer"
      >
        <ShoppingBag size={18} />
        Continue Shopping
      </button>
    </div>
  );
}