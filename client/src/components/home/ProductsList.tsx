"use client";

import { fetchData } from '@/lib/api';
import { Product } from '@/types/type'
import React, { useEffect, useState } from 'react'
import ProductCard from '../common/ProductCard';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

interface ProductsResponse {
  products: Product[];
  total: number;
}

const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchData<ProductsResponse>("/products?limit=10");
        setProducts(data.products);
      } catch (error) {
        console.log("Product fetching Error:", error);
      }
    };
    getProducts();
  }, []);

  if (products?.length === 0) {
    return (
      <div className="bg-babyshopWhite p-5 rounded-md mt-3">
        <p className="text-xl font-semibold">No Products Available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-babyshopWhite border mt-3 rounded-md">
      {/* Header */}
      <div className="p-5 border-b flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            🛍️ All Products
          </h2>
          <p className="text-gray-600 mt-1">
            Explore our complete collection
          </p>
        </div>

        {/* Desktop button */}
        <Link href="/shop">
          <Button className="hidden md:flex items-center gap-2 bg-babyshopSky hover:bg-babyshopSky/90">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="w-full p-5 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products?.map((product) => (
          <ProductCard key={product?._id} product={product} />
        ))}
      </div>

      {/* Mobile button */}
      <div className="p-5 pt-0 md:hidden">
        <Link href="/shop">
          <Button className="w-full bg-babyshopSky hover:bg-babyshopSky/90">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ProductsList
