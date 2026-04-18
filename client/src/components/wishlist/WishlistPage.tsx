"use client";

import { useState } from "react";
import { LayoutGrid, List, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useWishlistStore } from "@/lib/store";
import WishlistCard from "./WishlistCard";
import WishlistListItem from "./WishlistListItem";
import WishlistEmptyState from "./WishlistEmptyState";
import ClearWishlistDialog from "./ClearWishlistDialog";
import { removeFromWishlist, clearWishlist as clearWishlistApi } from "@/lib/wishlistApi";
import Cookies from "js-cookie";

type ViewMode = "grid" | "list";

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const {
    wishlistItems,
    removeFromWishlist: removeFromStore,
    clearWishlist: clearStore,
  } = useWishlistStore();

  const handleRemove = async (productId: string) => {
    // Optimistic update
    removeFromStore(productId);

    try {
      const token = Cookies.get("auth_token");
      if (token) await removeFromWishlist(productId, token);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const handleClearConfirm = async () => {
    // Optimistic update
    clearStore();
    setShowClearDialog(false);

    try {
      const token = Cookies.get("auth_token");
      if (token) await clearWishlistApi(token);
      toast.success("Wishlist cleared");
    } catch {
      toast.error("Failed to clear wishlist. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="bg-white rounded-2xl px-5 py-3 mb-6 flex items-center gap-2 text-sm text-gray-500 shadow-sm">
          <Link href="/" className="hover:text-teal-500 transition-colors">
            🏠
          </Link>
          <span>/</span>
          <Link href="/user/profile" className="hover:text-teal-500 transition-colors">
            User
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-800">Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} in your wishlist
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-teal-500 text-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-teal-500 text-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Clear All */}
              <button
                onClick={() => setShowClearDialog(true)}
                className="flex items-center gap-2 text-red-500 font-semibold text-sm hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {wishlistItems.length === 0 ? (
          <WishlistEmptyState />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {wishlistItems.map((product) => (
              <WishlistListItem
                key={product._id}
                product={product}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear Wishlist Dialog */}
      {showClearDialog && (
        <ClearWishlistDialog
          onConfirm={handleClearConfirm}
          onCancel={() => setShowClearDialog(false)}
        />
      )}
    </div>
  );
}