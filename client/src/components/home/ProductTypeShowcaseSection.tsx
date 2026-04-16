"use client";

import { fetchData } from "@/lib/api";
import { Product, ProductType } from "@/types/type";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../common/ProductCard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface ProductsResponse {
  products: Product[];
  total: number;
}

const ProductTypeShowcaseSection = ({
  productType,
}: {
  productType: ProductType;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchData<ProductsResponse>(
          `/products?productType=${productType._id}&limit=8&sortOrder=desc`
        );
        setProducts(response.products || []);
      } catch (error) {
        console.error(`Error loading products for ${productType.name}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [productType._id, productType.name]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-babyshopWhite p-5 mt-5 rounded-md border">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {productType.name}
          </h2>
          {productType.description && (
            <p className="text-gray-600">{productType.description}</p>
          )}
        </div>

        <Link href={`/shop?productType=${productType._id}`}>
          <Button className="hidden md:flex items-center gap-2 w-full bg-babyshopSky hover:bg-babyshopSky/90">
            Shop All Items
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center md:hidden">
        <Link href={`/shop?productType=${productType._id}`}>
          <Button className="w-full bg-babyshopSky hover:bg-babyshopSky/90">
            Shop All Items
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default ProductTypeShowcaseSection;
