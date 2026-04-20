"use client";

import { Product } from "@/types/type";
import ProductCard from "@/components/common/ProductCard"; 

interface RelatedProductsProps {
    products: Product[];
    title?: string;
}

export default function RelatedProducts({
    products,
    title = "Related Products",
}: RelatedProductsProps) {
    return (
        <section className="bg-babyshopWhite shadow-babyshopBlack/10 shadow-sm border border-babyshopTextLight/30 rounded-xl p-5 md:p-10 mt-5">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-babyshopBlack">{title}</h2>
            </div>

            {/* Grid */}
            {products.length === 0 ? (
                <p className="text-center text-babyshopTextLight py-10">No products found.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}