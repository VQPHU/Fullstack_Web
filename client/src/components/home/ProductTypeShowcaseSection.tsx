"use client";

import { fetchData } from "@/lib/api";
import { Product, ProductType, AdsBanner } from "@/types/type";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../common/ProductCard";
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
  const [adsBanners, setAdsBanners] = useState<AdsBanner[]>([]);
  const [activeComponents, setActiveComponents] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, bannersRes, homepageData] = await Promise.all([
          fetchData<ProductsResponse>(
            `/products?productType=${productType._id}&limit=8&sortOrder=desc`
          ),
          fetchData<AdsBanner[]>(`/ads-banners?status=Active`),
          fetchData<{ components: { name: string }[] }>("/components/homepage"),
        ]);

        const active = homepageData?.components?.map((c) => c.name) || [];
        setActiveComponents(active);

        setProducts(productsRes.products || []);

        // Lấy tất cả banners match với productType này
        const matched = bannersRes.filter((b) => {
          if (typeof b.title === "object" && b.title !== null) {
            return b.title._id === productType._id;
          }
          return b.title === productType._id;
        });

        setAdsBanners(matched);
        setCurrentSlide(0);
      } catch (error) {
        console.error(`Error loading data for ${productType.name}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productType._id, productType.name]);

  if (!loading && products.length === 0) return null;

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + adsBanners.length) % adsBanners.length);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % adsBanners.length);

  return (
    <section className="py-12 bg-babyshopWhite p-5 mt-5 rounded-md border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {productType.name}
          </h2>
          {productType.description && (
            <p className="text-gray-600">{productType.description}</p>
          )}
        </div>
        <Link href={`/shop?productType=${productType._id}`}>
          <Button className="hidden md:flex items-center gap-2 bg-babyshopSky hover:bg-babyshopSky/90">
            Shop All Items
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Ads Banner Slider */}
      {activeComponents.includes("ads_banner") && adsBanners.length > 0 && (
        <div className="w-full my-4 rounded-xl overflow-hidden relative group cursor-pointer">
          {/* Ảnh */}
          <img
            src={adsBanners[currentSlide].image}
            alt={adsBanners[currentSlide].name}
            className="w-full h-[420px] object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Name góc trên trái */}
          <div className="absolute top-3 left-4 bg-black/40 text-white text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            {adsBanners[currentSlide].name}
          </div>

          {/* Arrows + Dots — chỉ hiện nếu có nhiều hơn 1 */}
          {adsBanners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition text-lg"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition text-lg"
              >
                ›
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {adsBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentSlide
                      ? "bg-white w-4"
                      : "bg-white/40"
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Product List */}
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