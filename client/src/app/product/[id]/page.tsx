import BackToHome from "@/components/common/BackToHome";
import ProductImage from "@/components/common/pages/product/ProductImage";
import { fetchData } from "@/lib/api";
import { Product, Rating } from "@/types/type";
import React from "react";
import Container from "@/components/common/container";
import Image from "next/image";
import DiscountBadge from "@/components/common/DiscountBadge";
import ProductActions from "@/components/common/pages/product/ProductActions";
import PriceFormatter from "@/components/common/PriceFormatter";
import { Box, FileQuestion, Share2, Star, Truck, Package, Tag } from "lucide-react";
import ProductDescription from "@/components/common/pages/product/ProductDescription";
import { payment } from "@/assets/image";
import RelatedProducts from "@/components/common/pages/product/Relatedproducts";

// ---- Star Display ----
const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={15}
                className={
                    star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-none text-babyshopTextLight"
                }
            />
        ))}
    </div>
);

// ---- Estimated delivery date ----
const getEstimatedDelivery = () => {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date();
    end.setDate(end.getDate() + 14);
    const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${fmt(start)} - ${fmt(end)}`;
};

// ---- Main Page ----
const SingleProductPage = async ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;
    const product: Product = await fetchData(`/products/${id}`);

    if (!product) {
        return (
            <div className="min-h-[50vh] flex flex-col gap-2 items-center justify-center p-10">
                <h2 className="text-lg">
                    No products found with <span className="font-medium">#id</span>{" "}
                    <span className="font-semibold text-babyshopSky underline">{id}</span>
                </h2>
                <BackToHome />
            </div>
        );
    }

    const discountedPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
    const approvedReviews = product.ratings?.filter((r: Rating) => r.status === "approved") ?? [];
    const reviewCount = approvedReviews.length;

    // Fetch tất cả products cùng productType. Lưu ý: API trả về object { products, total }
    const allProductsRes = await fetchData<{ products: Product[] }>(`/products?productType=${product?.productType?._id}`);
    const relatedProducts = (allProductsRes?.products || []).filter((p) => p._id !== id);

    return (
        <div className="pt-5 pb-5 mx-4">
            <Container>
                <div className="bg-babyshopWhite shadow-babyshopBlack/10 shadow-sm border border-babyshopTextLight/30 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-10 p-5 md:p-10">
                    {/* Left: Image */}
                    <div>
                        <ProductImage src={product?.image} alt={product?.name} />
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col gap-5">
                        <DiscountBadge
                            discountPercentage={product?.discountPercentage}
                            className="w-14"
                        />

                        <ProductActions product={product} />

                        <div className="flex items-center gap-5 justify-between">
                            <div className="flex items-center gap-2">
                                <PriceFormatter
                                    amount={product?.price}
                                    className="text-babyshopTextLight line-through font-medium text-lg"
                                />
                                <PriceFormatter
                                    amount={discountedPrice}
                                    className="text-babyshopRed text-2xl font-bold"
                                />
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <div className="flex items-center gap-1.5">
                                    <StarDisplay rating={product?.averageRating ?? 0} />
                                    <span className="text-sm font-medium text-babyshopBlack">
                                        {(product?.averageRating ?? 0).toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-xs text-babyshopTextLight">({reviewCount} reviews)</p>
                            </div>
                        </div>

                        <p className="text-sm text-babyshopBlack/60">
                            {product?.stock > 0 ? `${product.stock} items in stock` : "Out of stock"}
                        </p>

                        <hr className="border-babyshopTextLight/30" />

                        <div className="border border-babyshopTextLight/30 rounded-xl p-4 bg-gray-50/50">
                            <p className="font-semibold text-babyshopBlack mb-2">About This Product</p>
                            <p className="text-sm text-babyshopBlack/70 leading-relaxed">
                                {product?.description || "No description available."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 border border-babyshopTextLight/30 rounded-xl p-3 bg-gray-50/50">
                                <Package size={20} className="text-babyshopSky flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-babyshopTextLight">Category</p>
                                    <p className="font-semibold text-sm text-babyshopBlack">
                                        {product?.category?.name ?? "—"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border border-babyshopTextLight/30 rounded-xl p-3 bg-gray-50/50">
                                <Tag size={20} className="text-babyshopSky flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-babyshopTextLight">Brand</p>
                                    <p className="font-semibold text-sm text-babyshopBlack">
                                        {product?.brand?.name ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="/user/checkout"
                            className="w-full py-3 text-base font-semibold text-white bg-babyshopSky hover:bg-babyshopSky/90 transition-colors rounded-xl text-center"
                        >
                            Buy Now
                        </a>

                        <div className="flex items-center border border-babyshopTextLight/30 rounded-xl overflow-hidden">
                            <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-babyshopBlack hover:bg-gray-50 transition-colors">
                                <FileQuestion size={18} />
                                <span>Ask Question</span>
                            </button>
                            <div className="w-px bg-babyshopTextLight/30 self-stretch" />
                            <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-babyshopBlack hover:bg-gray-50 transition-colors">
                                <Share2 size={18} />
                                <span>Share</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 border border-babyshopTextLight/30 rounded-xl p-4 bg-gray-50/50">
                                <Truck size={28} className="text-babyshopSky flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm text-babyshopBlack">Estimated Delivery</p>
                                    <p className="text-xs text-babyshopBlack/60">{getEstimatedDelivery()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border border-babyshopTextLight/30 rounded-xl p-4 bg-gray-50/50">
                                <Box size={28} className="text-babyshopSky flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm text-babyshopBlack">Free Shipping & Returns</p>
                                    <p className="text-xs text-babyshopBlack/60">On all orders over $200.00</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-babyshopTextLight/10 border border-babyshopTextLight/20 rounded-xl flex flex-col items-center justify-center p-5">
                            <Image
                                src={payment}
                                alt="paymentImage"
                                className="w-72 sm:w-80 mb-2"
                            />
                            <p className="text-sm text-babyshopBlack/70 text-center">
                                Guaranteed safe & secure checkout
                            </p>
                        </div>
                    </div>
                </div>

                <div className=" bg-babyshopWhite shadow-babyshopBlack/10 shadow-sm border border-babyshopTextLight/30 rounded-xl p-5 md:p-10 mt-5">
                    <ProductDescription product={product} />
                </div>

                <RelatedProducts
                    products={relatedProducts}
                    title="Related Products"
                />
            </Container>
        </div>
    );
};

export default SingleProductPage;