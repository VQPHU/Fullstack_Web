"use client";

import { fetchData } from '@/lib/api';
import { Product } from '@/types/type'
import React, { useEffect, useState } from 'react'
import ProductCard from '../common/ProductCard';


interface ProductsResponse {
  products: Product[];
  total: number;
}

const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        // Đổi perPage thành limit để khớp với định nghĩa ở Backend
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
      <div className="w-full p-5 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products?.map((product) => (
          <ProductCard key={product?._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default ProductsList
