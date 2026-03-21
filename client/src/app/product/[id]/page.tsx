import BackToHome from '@/components/common/BackToHome';
import { fetchData } from '@/lib/api';
import { Product } from '@/types/type';
import React from 'react'
import Container from "@/components/common/container";
import Image from 'next/image';
import DiscountBadge from '@/components/common/DiscountBadge';
import ProductActions from '@/components/common/pages/product/ProductActions';
import PriceFormatter from '@/components/common/PriceFormatter';
import { Box, Eye, FileQuestion, Share2, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SingleProductPage = async ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;
    const product: Product = await fetchData(`/products/${id}`);

    const discountedPrice =
        product?.price * (1 - product?.discountPercentage / 100);

    if (!product) {
        return (
            <div className="min-h-[50vh] flex flex-col gap-2 items-center justify-center p-10">
                <h2 className="text-lg">
                    No products found with <span className=" font-medium">#id</span>{" "}
                    <span className="font-semibold text-babyshopSky underline">{id}</span>
                </h2>
                <BackToHome />
            </div>
        );
    }
    return (
        <div className='pt-5 mx-4'>
            <Container className="max-w-screen-xl bg-babyshopWhite shadow-babyshopBlack/10 shadow-sm border
                 border-babyshopTextLight/30 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-10 p-5 md:p-10">
                <div>
                    <Image src={product?.image}
                        alt="productImage"
                        width={500}
                        height={500} />
                </div>
                <div className='space-y-5'>
                    <DiscountBadge
                        discountPercentage={product?.discountPercentage}
                        className="w-14"
                    />
                    <ProductActions product={product} />
                    {/* Priceview */}
                    <div className="flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-2">
                            <PriceFormatter amount={product?.price}
                                className="text-babyshopTextLight line-through font-medium text-lg" />
                            <PriceFormatter amount={discountedPrice}
                                className="text-babyshopRed text-2xl" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center text-babyshopTextLight">
                                <Star size={15} />
                                <Star size={15} />
                                <Star size={15} />
                                <Star size={15} />
                                <Star size={15} />
                            </div>
                            <p className="text-sm">({0} reviews)</p>
                        </div>
                    </div>
                    {/* user view */}
                    <p className="flex items-center gap-1">
                        <Eye />
                        <span className="font-semibold">29</span>{" "}
                        <span className="text-babyshopBlack/70">
                            people are viewing this right now
                        </span>
                    </p>

                    <Button className="py-5 text-base">Buy now</Button>
                    <div className="flex items-center gap-5 justify-between border-b border-b-babyshopTextLight/50 pb-5">
                        <div className="flex items-center gap-2">
                            <FileQuestion /> <p>Ask a Question</p>
                        </div>{" "}
                        <div className="flex items-center gap-2">
                            <Share2 /> <p>Share</p>
                        </div>
                    </div>

                    {/* Delivery part */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                            <Truck size={30} />{" "}
                            <div>
                                <p className="font-medium">
                                    Estimated Delivery:{" "}
                                    <span className="text-sm text-babyshopBlack/70">
                                        08 - 15 Jun, 2025
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Box size={30} />{" "}
                            <div>
                                <p className="font-medium">
                                    Free Shipping & Returns:{" "}
                                    <span className="text-sm text-babyshopBlack/70">
                                        On all orders over $200.00
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container >
        </div >
    )
}

export default SingleProductPage