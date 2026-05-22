import React from 'react'
import PriceFormatter from './PriceFormatter';
import { getDiscountedPrice } from '@/lib/price';

interface Props {
    price: number;
    discountPercentage?: number;
}
const PriceContainer = ({ price, discountPercentage = 0 }: Props) => {
    const discountedPrice = getDiscountedPrice(price, discountPercentage);
    const hasDiscount = discountPercentage > 0;

    return (
        <div className="flex items-center gap-2 text-sm">
            {hasDiscount && (
                <PriceFormatter
                    amount={price}
                    className="text-babyshopTextLight line-through font-medium"
                />
            )}
            <PriceFormatter amount={discountedPrice} className="text-babyshopRed" />
        </div>
    )
}

export default PriceContainer