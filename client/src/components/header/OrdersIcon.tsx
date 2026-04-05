"use client";
import { useOrderStore } from '@/lib/store';
import { Package } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const OrdersIcon = () => {
    const { orders } = useOrderStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering order count on server
    if (!mounted) {
        return (
            <Link href={"/user/orders"}
                className="relative hover:text-babyshopSky hoverEffect">
                <Package size={24} />
                <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    0
                </span>
            </Link>
        );
    }

    const totalOrders = orders?.length || 0;

    return (
        <Link href={"/user/orders"}
            className="relative hover:text-babyshopSky hoverEffect">
            <Package size={24} />
            <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                {totalOrders > 99 ? "99+" : totalOrders}
            </span>
        </Link>
    )
}

export default OrdersIcon