import { cn } from '@/lib/utils';
import React from 'react'

interface Props {
    amount: number | undefined;
    className?: string;
}
const PriceFormatter = ({ amount, className }: Props) => {
    if (!amount) return null;
    const formattedPrice = new Number(amount).toLocaleString("en-US", {
        currency: "USD",
        style: "currency",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return (
        <span
            className={cn(
                "text-sm font-semibold text-tech_dark_color",
                className
            )}
        >
            {formattedPrice}
        </span>
    );
};

export default PriceFormatter