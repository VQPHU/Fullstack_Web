import { Product } from '@/types/type'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import DiscountBadge from './DiscountBadge'
import PriceContainer from './PriceContainer'
import AddToCartButton from './AddToCartButton'
import WishlistButton from './pages/product/WishlistButton'

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
            <WishlistButton
                product={product}
                className='absolute top-2 right-2 border'
            />
            <hr />
            <div className="px-4 py-2 space-y-1">
                <p className='uppercase text-xs font-medium text-babyshopTextLight'>
                    {product?.category?.name}
                </p>
                <p className="line-clamp-2 h-12 font-medium text-base">{product?.name}</p>
                <PriceContainer
                    price={product?.price}
                    discountPercentage={product?.discountPercentage}
                />
                <div className='flex items-center text-xs font-sans'>
                    <p>In Stock: </p>
                    <p className='text-babyshopSky'>{product?.stock}</p>
                </div>
                <AddToCartButton product={product} />
            </div>
        </div>
    )
}

export default ProductCard