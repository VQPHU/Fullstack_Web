import { Product } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import DiscountBadge from './DiscountBadge'

const ProductCard = ({ product }: { product: Product }) => {
    return (
        <div className="border rounded-md group overflow-hidden w-full relative">
            <Link
                href={`/product/${product?._id}`}
                className="p-2 overflow-hidden relative block"
            >
                <Image
                    src={product?.image}
                    width={500}
                    height={500}
                    alt="productIamge"
                    className="w-full h-32 object-cover group-hover:scale-110 hoverEffect"
                />
                <DiscountBadge
                    discountPercentage={product?.discountPercentage}
                    className="absolute top-4 left-2"
                />
            </Link>
            {/* Wishlist Button */}
            <hr />
            <div className="px-4 py-2 space-y-1">
                <p className='className="uppercase text-xs font-medium text-babyshopTextLight'>
                    {product?.category?.name}
                </p>
                <p className="line-clamp-2 text-sm">{product?.name}</p>
            </div>
        </div>
    )
}

export default ProductCard