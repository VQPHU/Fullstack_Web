import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const CartIcon = () => {
  return (
        <Link   href={"/user/wishlist"}
                className="relative hover:text-babyshopSky hoverEffect">
                <ShoppingBag size={24} />
                <span className="absolute -right-2 -top-2 bg-babyshopSky
                   text-babyshopWhite text-[11px] 
                  font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    0
                </span>
            </Link>
  )
}

export default CartIcon