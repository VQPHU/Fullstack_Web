"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input';
import { Loader2, Search, X } from 'lucide-react';
import { Product } from '@/types/type';
import { useDebounce } from 'use-debounce';
import { fetchData } from '@/lib/api';
import Link from 'next/link';
import AddToCartButton from '../common/AddToCartButton';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

interface ProductsResponse {
    products: Product[];
    total: number;
}

const Searchinput = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 300);
    const [products, setProducts] = useState<Product[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);

    const fetchFeaturedProducts = async () => {
        try {
            const response = await fetchData<ProductsResponse>("/products");
            setFeaturedProducts(response.products);
        } catch (error) {
            console.error("Error fetching featured products:", error);
        }
    };

    const fetchProducts = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setProducts([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetchData<ProductsResponse>(
                `/products?page=1&limit=10&search=${encodeURIComponent(searchTerm)}`
            );
            setProducts(response.products);
        } catch {
            setError("Failed to fetch products");
            // console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    useEffect(() => {
        if (showSearch && mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, [showSearch]);

    const toggleMobileSearch = () => {
        setShowSearch(!showSearch);
        if (!showSearch) {
            setSearch("");
            setShowResults(true);
        }
    };

    return (
        <div ref={searchRef} className="relative lg:w-full">
            {/* Desktop search */}
            <button onClick={toggleMobileSearch} className="lg:hidden mt-1.5 border p-2 rounded-full
            hover:border-babyshopSky hover:bg-babyshopSky/10 group hoverEffect">
                {showSearch ? (
                    <X className="w-5 h-5 text-babyshopBlack group-hover:text-babyshopRed hoverEffect" />
                ) : (
                    <Search className="w-5 h-5 text-babyshopBlack group-hover:text-babyshopRed hoverEffect" />
                )}
            </button>
            <form
                className="relative hidden lg:flex items-center"
                onSubmit={(e) => e.preventDefault()}
            >
                <Input
                    placeholder="Search Products..."
                    className="flex-1 rounded-md py-5 focus-visible:ring-0 focus-visible:border-babyshopRed
                     bg-white text-babyshopText placeholder:font-semibold placeholder:tracking-wide pr-16"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowResults(true)}
                />
                {search ? (
                    <X
                        onClick={() => setSearch("")}
                        className="w-5 h-5 absolute right-3 top-2.5 text-babyshopText
                         hover:text-babyshopRed hoverEffect cursor-pointer"
                    />
                ) : (
                    <Search className="absolute right-3 top-3 w-5 h-5 text-babyshopText" />
                )}
            </form>

            {/* Mobile search overlay */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed lg:hidden left-0 top-24 w-full px-1 py-1 md:px-5 md:py-2 bg-white"
                    >
                        <div className="bg-white p-4 shadow-lg rounded-md">
                            <div className="relative flex items-center">
                                <Input
                                    ref={mobileInputRef}
                                    placeholder="Search Products..."
                                    className="w-full pr-16 py-5 rounded-md focus-visible:ring-0 focus-visible:border-babyshopRed bg-white text-babyshopText placeholder:font-semibold"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => setShowResults(true)}
                                />
                                {search ? (
                                    <X
                                        onClick={() => setSearch("")}
                                        className="absolute right-4 w-5 h-5 text-babyshopText hover:text-babyshopRed hoverEffect cursor-pointer"
                                    />
                                ) : (
                                    <Search className="absolute right-4 w-5 h-5 text-babyshopText" />
                                )}
                            </div>

                            {/* Mobile search results */}
                            {showResults && (
                                <div className="mt-2 bg-white rounded-md shadow-lg overflow-y-auto border border-gray-200 max-h-[50vh]">
                                    {loading ? (
                                        <div className="flex items-center justify-center px-6 gap-2 py-4 text-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-babyshopRed" />
                                            <span className="font-medium text-gray-600">
                                                Searching...
                                            </span>
                                        </div>
                                    ) : products?.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-700">
                                                    Search Results ({products.length})
                                                </p>
                                            </div>
                                            {products.map((product) => (
                                                <div
                                                    key={product._id}
                                                    onClick={() => {
                                                        setShowResults(false);
                                                        setSearch("");
                                                        setShowSearch(false);
                                                    }}
                                                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-4 py-3 cursor-pointer"
                                                >
                                                    <Link
                                                        href={`/product/${product._id}`}
                                                        className="flex items-center gap-3"
                                                    >
                                                        {product.image && (
                                                            <div className="w-12 h-12 bg-gray-50 rounded flex-shrink-0 overflow-hidden">
                                                                <Image  
                                                                    height={200}
                                                                    width={200}
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="object-contain w-full h-full"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                                                {product.name}
                                                            </h3>
                                                            {product.price && (
                                                                <p className="text-sm font-semibold text-babyshopSky mt-0.5">
                                                                    ${product.price}
                                                                </p>
                                                            )}
                                                            {(product.category?.name ||
                                                                product.brand?.name) && (
                                                                    <p className="text-sm text-babyshopTextLight">
                                                                        {product.category?.name || "No Category"} -{" "}
                                                                        {product.brand?.name || "No Brand"}
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                                                <Link
                                                    href={`/shop?search=${encodeURIComponent(search)}`}
                                                    onClick={() => {
                                                        setShowResults(false);
                                                        setShowSearch(false);
                                                    }}
                                                    className="text-sm text-babyshopSky font-medium hover:underline"
                                                >
                                                    View all results
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                {!search ? (
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Popular Products
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-medium text-gray-700">
                                                        No results for &quot;
                                                        <span className="text-babyshopRed">{search}</span>
                                                        &quot;
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                {featuredProducts?.length > 0 &&
                                                    featuredProducts.map((item) => (
                                                        <div
                                                            key={item._id}
                                                            className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setSearch(item.name);
                                                                    setShowResults(true);
                                                                }}
                                                                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:cursor-pointer"
                                                            >
                                                                <Search className="text-babyshopText w-5 h-5" />
                                                                <div>
                                                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                                                        {item.name}
                                                                    </h3>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Desktop search results dropdown */}
            {showResults && !showSearch && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-md shadow-lg z-50 max-h-[70vh] overflow-y-auto border border-gray-200 hidden lg:block ">
                    {loading ? (
                        <div className="flex items-center justify-center px-6 gap-2 py-4 text-center">
                            <Loader2 className="w-5 h-5 animate-spin text-babyshopRed" />
                            <span className="font-medium text-gray-600">Searching...</span>
                        </div>
                    ) : products?.length > 0 ? (
                        <div className="py-0">
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-700">
                                    Search Results ({products.length})
                                </p>
                                {error && (
                                    <p className="text-sm font-medium text-babyshopRed">
                                        {error}
                                    </p>
                                )}
                            </div>
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-4 py-3 flex items-center gap-5 justify-between"
                                >
                                    <div
                                        className="flex-1"
                                        onClick={() => {
                                            setShowResults(false);
                                            setSearch("");
                                        }}
                                    >
                                        <Link
                                            href={`/product/${product._id}`}
                                            className="flex items-center gap-3"
                                        >
                                            {product.image && (
                                                <div className="w-12 h-12 bg-gray-50 rounded flex-shrink-0 overflow-hidden">
                                                    <Image
                                                        width={200}
                                                        height={200}
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="object-contain w-full h-full"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                {product.price && (
                                                    <p className="text-sm font-semibold text-babyshopSky mt-0.5">
                                                        ${product.price}
                                                    </p>
                                                )}
                                                {(product.category?.name || product.brand?.name) && (
                                                    <p className="text-sm text-babyshopTextLight">
                                                        {product.category?.name || "No Category"} -{" "}
                                                        {product.brand?.name || "No Brand"}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                    <AddToCartButton product={product} />
                                </div>
                            ))}
                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                                <Link
                                    href={`/shop?search=${encodeURIComponent(search)}`}
                                    onClick={() => {
                                        setShowResults(false);
                                    }}
                                    className="text-sm text-babyshopSky font-medium hover:underline"
                                >
                                    View all results
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                {!search ? (
                                    <p className="text-sm font-medium text-gray-700">
                                        Popular Products
                                    </p>
                                ) : (
                                    <p className="text-sm font-medium text-gray-700">
                                        No results for &quot;
                                        <span className="text-babyshopRed">{search}</span>&quot;
                                    </p>
                                )}
                            </div>
                            <div>
                                {featuredProducts?.length > 0 &&
                                    featuredProducts.map((item) => (
                                        <div
                                            key={item._id}
                                            className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                        >
                                            <button
                                                onClick={() => {
                                                    setSearch(item.name);
                                                    setShowResults(true);
                                                }}
                                                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:cursor-pointer"
                                            >
                                                <Search className="text-babyshopBlack/60 w-5 h-5" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                                        {item.name}
                                                    </h3>
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Searchinput
