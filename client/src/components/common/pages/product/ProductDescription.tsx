"use client";
import React, { useState, useEffect } from "react";

import { Product, Rating } from "@/types/type";
import { useUserStore } from "@/lib/store";
import authApi from "@/lib/authApi";
import { Star, Package, Tag, MessageSquareText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProductDescriptionProps {
  product?: Product;
}

// ---- Star Picker cho Form Đánh giá ----
const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${star <= (hovered || value)
                ? "fill-[#4BBFB0] text-[#4BBFB0]"
                : "fill-none text-gray-300"
              }`}
          />
        </button>
      ))}
    </div>
  );
};

// ---- Phần 3: Reviews (Ảnh 3) ----
const ReviewsSection = ({ product }: { product?: Product }) => {
  const { isAuthenticated } = useUserStore();
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    if (!product?._id) return;
    try {
      const res = await authApi.get(`/products/${product._id}`);
      if (res.success && res.data?.ratings) {
        // Chỉ lấy các review đã được approve
        const approved = res.data.ratings.filter(
          (r: Rating) => r.status === "approved"
        );
        setReviews(approved);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product?._id]);

  const handleSubmit = async () => {
    if (selectedStar === 0) return setError("Please select a rating.");
    setSubmitting(true);
    try {
      const res = await authApi.post(`/products/${product?._id}/rate`, {
        rating: selectedStar,
        comment,
      });
      if (res.success) {
        setShowForm(false);
        setSelectedStar(0);
        setComment("");
        fetchReviews();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#4BBFB0]/10 rounded-lg">
          <Star className="w-5 h-5 text-[#4BBFB0]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          Customer Reviews ({reviews.length})
        </h3>
      </div>

      {/* Empty State theo ảnh 3 */}
      {reviews.length === 0 && !showForm ? (
        <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-12 flex flex-col items-center justify-center space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-7 h-7 text-gray-200 fill-none" />
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">
                    {review.userId.name}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= review.rating
                            ? "fill-[#4BBFB0] text-[#4BBFB0]"
                            : "text-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer Action theo ảnh 3 */}
      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
        <span className="font-bold text-gray-900">Write a Review</span>
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4BBFB0] text-white text-sm font-semibold rounded-lg hover:bg-[#3ca89a] transition-colors shadow-sm"
          >
            <Star className="w-4 h-4 fill-white" />
            Add Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-5 border border-gray-200 rounded-xl space-y-4 bg-white shadow-md">
          <StarPicker value={selectedStar} onChange={setSelectedStar} />
          <textarea
            className="w-full p-3 border rounded-lg text-sm focus:ring-1 focus:ring-[#4BBFB0] outline-none bg-gray-50/50"
            placeholder="Write your review here... (Min 10 characters)"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-[#4BBFB0] text-white rounded-lg text-sm font-medium hover:bg-[#3ca89a] transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Component Chính (Danh sách tuần tự, không dùng Tab) ----
export default function ProductDescription({ product }: ProductDescriptionProps) {
  // Chuẩn bị data cho Specifications giống ảnh 2
  const specificationsData = [
    { label: "Product Name", value: product?.name || "N/A" },
    { label: "Price", value: `$${product?.price || 0}`, isBold: true },
    {
      label: "Discount",
      value: `${product?.discountPercentage || 0}% OFF`,
      color: "text-red-500 font-bold",
    },
    {
      label: "Stock Status",
      value:
        product?.stock && product.stock > 0
          ? `In Stock (${product.stock} available)`
          : "Out of Stock",
      color: "text-green-600 font-medium",
    },
    { label: "Category", value: product?.category?.name || "N/A" },
    { label: "Brand", value: product?.brand?.name || "N/A" },
    {
      label: "Average Rating",
      value: product?.averageRating?.toFixed(1) || "0.0",
      isRating: true,
    },
  ];

  return (
    // Max width to match the layout in images
    <div className="w-full mx-auto space-y-8">
      <Card className="mx-auto border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#4BBFB0]/10 rounded-lg">
              <Package className="w-5 h-5 text-[#4BBFB0]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Product Description
            </h3>
          </div>
          <p className="text-gray-600 leading-relaxed text-base">
            {product?.description || "No description available for this product."}
          </p>
        </CardContent>
      </Card>

      {/* Phần 2: Specifications (Ảnh 2 - Dạng bảng) */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#4BBFB0]/10 rounded-lg">
              <Tag className="w-5 h-5 text-[#4BBFB0]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Product Specifications
            </h3>
          </div>

          {/* Cấu trúc bảng Table giống ảnh 2 */}
          <div className="border border-gray-100 rounded-xl overflow-hidden text-sm">
            {specificationsData.map((item, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-2 p-4 items-center ${idx !== specificationsData.length - 1
                    ? "border-b border-gray-50"
                    : ""
                  }`}
              >
                <span className="font-bold text-gray-900">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`${item.color ||
                      (item.isBold
                        ? "text-gray-900 font-semibold"
                        : "text-gray-600")
                      }`}
                  >
                    {item.value}
                  </span>
                  {item.isRating && (
                    <Star className="w-4 h-4 fill-[#4BBFB0] text-[#4BBFB0]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phần 3: Reviews (Ảnh 3 - Bao gồm cả Form đánh giá) */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-8">
          <ReviewsSection product={product} />
        </CardContent>
      </Card>
    </div>
  );
}