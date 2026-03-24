"use client";
import { useCartStore } from '@/lib/store';
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const CartIcon = () => {
  const { cartItemsWithQuantities } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  // Prevent hydration mismatch by not rendering cart count on server
  if (!mounted) {
    return (
      <Link
        href={"/user/cart"}
        className="relative hover:text-babyshopSky hoverEffect"
      >
        <ShoppingBag />
        <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          0
        </span>
      </Link>
    );
  }

  const totalItems = cartItemsWithQuantities.length; // Number of unique products instead of total quantity


  return (
    <Link
      href={"/user/cart"}
      className="relative hover:text-babyshopSky hoverEffect"
    >
      <ShoppingBag />
      <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite
       text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </Link>
  )
}

export default CartIcon