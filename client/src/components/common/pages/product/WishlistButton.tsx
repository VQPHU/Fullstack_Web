"use client";
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    className?: string;
}

const WishlistButton = ({ className }: Props) => {
    return (
        <button
            className={cn("p-2 rounded-full transition-colors hover:bg-gray-100 ", className)}
        >
            <Heart
                size={20}
            />
        </button>
    );
};

export default WishlistButton;
