"use client";

import { useState } from "react";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore, useUserStore, useWishlistStore } from "@/lib/store";
import { toast } from "sonner";
import { Product } from "@/types/type";
import Image from "next/image";

interface WishlistCardProps {
  product: Product;
  onRemove: (id: string) => void;
}

export default function WishlistCard({ product, onRemove }: WishlistCardProps) {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [localLoading, setLocalLoading] = useState(false);

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name;

  const discountedPrice =
    product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : null;

  const handleCardClick = () => {
    router.push(`/product/${product._id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      router.push("/auth/signin");
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product, 1);
      toast.success("Added to cart successfully!", {
        description: `${product.name}`,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(product._id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Image area */}
      <div className="relative">
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{product.discountPercentage}%
          </span>
        )}
        <div className="relative h-52 bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {categoryName}
        </p>

        {/* Name */}
        <h3 className="text-sm font-bold text-gray-800 mb-3 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {discountedPrice ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-red-500">
                ${discountedPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-red-500">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRemove}
            className="p-2 rounded-xl border border-gray-200 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={localLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
          >
            {localLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}