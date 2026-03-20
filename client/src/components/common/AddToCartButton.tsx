"use client"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Product } from '@/types/type';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

interface Props {
    product: Product;
    className?: string;
}
const AddToCartButton = ({ product, className }: Props) => {


    const handleAddToCart = () => {
        toast.success("Button clicked")
    };
    return (
        <Button
            onClick={handleAddToCart}
            variant="outline"
            //   disabled={localLoading} // Only use localLoading
            className={cn("rounded-full px-6 mt-1", className)}
        >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to cart
        </Button>
    )
}

export default AddToCartButton