"use client";

import { Product } from "@/types/type";
import { useRouter } from "next/navigation";
import { useCartStore, useUserStore } from "@/lib/store";
import { useQuantityStore } from "@/lib/quantityStore";
import { toast } from "sonner";
import { useState } from "react";

interface BuyNowButtonProps {
    product: Product;
    className?: string;
}

export default function BuyNowButton({ product, className = "" }: BuyNowButtonProps) {
    const router = useRouter();
    const { isAuthenticated } = useUserStore();
    const { addToCart } = useCartStore();
    const { getProductQuantity } = useQuantityStore();
    const [loading, setLoading] = useState(false);

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error("Please sign in to continue");
            router.push("/auth/signin");
            return;
        }

        const quantity = getProductQuantity(product._id);
        setLoading(true);
        try {
            await addToCart(product, quantity);
            router.push("/user/checkout");
        } catch (error) {
            console.error("Buy now error:", error);
            toast.error("Failed to process. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleBuyNow}
            disabled={loading}
            className={className || "w-full py-3 text-base font-semibold text-white bg-babyshopSky hover:bg-babyshopSky/90 transition-colors rounded-xl text-center disabled:opacity-50"}
        >
            {loading ? "Processing..." : "Buy Now"}
        </button>
    );
}

