import { cn } from '@/lib/utils';
import React from 'react'

interface Props {
    discountPercentage: number;
    className?: string;
}
const DiscountBadge = ({ discountPercentage, className }: Props) => {
    return (
        <span
            className={cn(
                "block bg-babyshopRed text-babyshopWhite text-xs px-3 py-1 rounded-full font-semibold",
                className
            )}
        >
            -{discountPercentage}%
        </span>
    )
}

export default DiscountBadge