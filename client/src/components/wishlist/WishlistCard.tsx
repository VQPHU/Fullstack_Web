"use client";

import { Trash2 } from "lucide-react";
import { Product } from "@/types/type";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button"; // Import Button để đồng bộ style
import PriceContainer from "../common/PriceContainer";
import DiscountBadge from "../common/DiscountBadge";
import AddToCartButton from "../common/AddToCartButton";

interface WishlistCardProps {
  product: Product;
  onRemove: (id: string) => void;
}

const WishlistCard = ({ product, onRemove }: WishlistCardProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove(product._id);
  };

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name;

  return (
    <div className="border rounded-md group overflow-hidden w-full relative bg-white">
      <Link
        href={`/product/${product?._id}`}
        className="p-2 overflow-hidden relative block"
      >
        <Image
          src={product?.image}
          width={500}
          height={500}
          alt="productImage"
          className="w-full h-32 object-cover group-hover:scale-110 hoverEffect"
        />
        <DiscountBadge
          discountPercentage={product?.discountPercentage}
          className="absolute top-4 left-2"
        />
      </Link>

      <hr />

      <div className="px-4 py-2 space-y-1">
        <p className="uppercase text-xs font-medium text-babyshopTextLight">
          {categoryName}
        </p>
        <p className="line-clamp-2 h-12 font-medium text-base">
          {product?.name}
        </p>
        
        <PriceContainer
          price={product?.price}
          discountPercentage={product?.discountPercentage}
        />

        <div className="flex items-center text-xs font-sans">
          <p>In Stock: </p>
          <p className="text-babyshopSky ml-1">{product?.stock}</p>
        </div>

        {/* Cụm nút bấm: Flex ngang */}
        <div className="flex items-center gap-2 pt-2">
          {/* Nút Xóa: Sử dụng chung variant outline và h-10 để khớp với AddToCartButton */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRemove}
            className="rounded-full shrink-0 text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Nút Add To Cart: Thêm flex-1 để nó chiếm phần còn lại */}
          <AddToCartButton
            product={product} 
            className="flex-1 mt-0" // Bỏ mt-1 để căn thẳng hàng với nút xóa
          />
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;