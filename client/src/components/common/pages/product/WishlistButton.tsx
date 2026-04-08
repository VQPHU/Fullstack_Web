"use client";
import React from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/store";
import { addToWishlist, removeFromWishlist } from "@/lib/wishlistApi";
import { Product } from "@/types/type";
import Cookies from "js-cookie";

interface Props {
  product: Product;
  className?: string;
}

const WishlistButton = ({ product, className }: Props) => {
  const { addToWishlist: addToStore, removeFromWishlist: removeFromStore, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = Cookies.get("auth_token");
    if (!token) {
      toast.error("Please sign in to manage your wishlist");
      return;
    }

    try {
      if (inWishlist) {
        // Optimistic update
        removeFromStore(product._id);
        await removeFromWishlist(product._id, token);
        toast.success("Removed from wishlist");
      } else {
        // Optimistic update - truyền full Product object vào store
        addToStore(product);
        await addToWishlist(product._id, token);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-colors hover:bg-gray-100",
        className
      )}
    >
      <Heart
        size={20}
        className={cn(
          "transition-colors",
          inWishlist ? "fill-red-500 stroke-red-500" : "stroke-gray-500"
        )}
      />
    </button>
  );
};

export default WishlistButton;