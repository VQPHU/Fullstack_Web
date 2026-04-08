"use client";

interface ClearWishlistDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ClearWishlistDialog({
  onConfirm,
  onCancel,
}: ClearWishlistDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Clear Wishlist
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Are you sure you want to clear your wishlist? This action cannot be
          undone and all items will be removed from your wishlist.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors cursor-pointer"
          >
            Yes, Clear Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}