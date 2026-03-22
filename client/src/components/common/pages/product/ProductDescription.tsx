"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/type";


interface ProductDescriptionProps {
  product?: Product;
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="w-full">
      <Tabs
        defaultValue="description"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-babyshopWhite h-16 border border-babyshopTextLight/30 rounded-xl p-1">
          <TabsTrigger
            value="description"
            className="py-2 text-babyshopBlack hover:text-babyshopSky data-[state=active]:bg-babyshopSky data-[state=active]:text-babyshopWhite rounded-lg transition-all"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="brand"
            className="py-2 text-babyshopBlack hover:text-babyshopSky data-[state=active]:bg-babyshopSky data-[state=active]:text-babyshopWhite rounded-lg transition-all"
          >
            About the Brand
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="py-2 text-babyshopBlack hover:text-babyshopSky data-[state=active]:bg-babyshopSky data-[state=active]:text-babyshopWhite rounded-lg transition-all"
          >
            Reviews (0)
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="py-2 text-babyshopBlack hover:text-babyshopSky data-[state=active]:bg-babyshopSky data-[state=active]:text-babyshopWhite rounded-lg transition-all"
          >
            Questions
          </TabsTrigger>
        </TabsList>
        <div className="mt-5 p-5 bg-babyshopWhite border border-babyshopTextLight/30 rounded-xl">
          <TabsContent value="description">
            <h3 className="text-lg font-medium text-babyshopBlack mb-3">
              Product Description
            </h3>
            <p className="text-babyshopBlack/70">
              {product?.description ||
                "No description available for this product."}
            </p>
          </TabsContent>
          <TabsContent value="brand">
            <h3 className="text-lg font-medium text-babyshopBlack mb-3">
              About the Brand
            </h3>
            <p className="text-babyshopBlack/70">
              {product?.brand
                ? `Learn more about ${product?.brand?.name}, a trusted name in quality products.`
                : "No brand information available."}
            </p>
          </TabsContent>
          <TabsContent value="reviews">
            <h3 className="text-lg font-medium text-babyshopBlack mb-3">
              Customer Reviews
            </h3>
            <p className="text-babyshopBlack/70">
              No reviews yet. Be the first to share your experience!
            </p>
          </TabsContent>
          <TabsContent value="questions">
            <h3 className="text-lg font-medium text-babyshopBlack mb-3">
              Questions
            </h3>
            <p className="text-babyshopBlack/70">
              Have questions about this product? Ask away, and we&apos;ll get
              back to you!
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProductDescription;
