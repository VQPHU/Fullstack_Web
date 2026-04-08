"use client";
import { useWishlistStore } from '@/lib/store'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const WishlistIcon = () => {
    const { wishlistIds } = useWishlistStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Link href={"/user/wishlist"}
                className="relative hover:text-babyshopSky hoverEffect">
                <Heart size={24} />
                <span className="absolute -right-2 -top-2 bg-babyshopSky
                    text-babyshopWhite text-[11px] font-medium w-4 h-4 
                    rounded-full flex items-center justify-center">
                    0
                </span>
            </Link>
        );
    }

    const totalWishlist = wishlistIds?.length || 0;

    return (
        <Link href={"/user/wishlist"}
            className="relative hover:text-babyshopSky hoverEffect">
            <Heart size={24} />
            <span className="absolute -right-2 -top-2 bg-babyshopSky
                text-babyshopWhite text-[11px] font-medium w-4 h-4 
                rounded-full flex items-center justify-center">
                {totalWishlist > 99 ? "99+" : totalWishlist}
            </span>
        </Link>
    )
}

export default WishlistIcon