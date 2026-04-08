"use client";

import { useState } from "react";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore, useUserStore } from "@/lib/store";
import { toast } from "sonner";
import { Product } from "@/types/type";
import Image from "next/image";

interface WishlistListItemProps {
  product: Product;
  onRemove: (id: string) => void;
}

export default function WishlistListItem({
  product,
  onRemove,
}: WishlistListItemProps) {
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
      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-5"
    >
      {/* Image */}
      <div className="relative flex-shrink-0 w-28 h-24 bg-gray-50 rounded-xl overflow-hidden">
        {product.discountPercentage > 0 && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
            -{product.discountPercentage}%
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Category */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
          {categoryName}
        </p>

        {/* Name */}
        <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
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
            <Trash2 size={15} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={localLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
          >
            {localLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}