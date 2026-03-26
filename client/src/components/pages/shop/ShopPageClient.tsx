"use client"
import { fetchData } from '@/lib/api';
import { Brand, Category, Product } from '@/types/type';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'
import Container from "@/components/common/container";
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShopSkeleton from '@/components/skeleton/ShopSkeleton';
import ProductCard from '@/components/common/ProductCard';
import EmptyListDesign from '@/components/common/pages/product/EmptyListDesign';

interface ProductsResponse {
    products: Product[];
    total: number;
}

interface Props {
    categories: Category[];
    brands: Brand[];
}

const ShopPageClient = ({ categories, brands }: Props) => {
    const searchParams = useSearchParams();
    const [category, setCategory] = useState<string>(
        searchParams.get("category") || ""
    );
    const [brand, setBrand] = useState<string>(searchParams.get("brand") || "");
    const [search, setSearch] = useState<string>(
        searchParams.get("search") || ""
    );

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [newlyLoadedProducts, setNewlyLoadedProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [invalidCategory, setInvalidCategory] = useState<string>("");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const productsPerPage = 10;

    useEffect(() => {
        const cotegoryFromUrl = searchParams.get("category");
        if (cotegoryFromUrl) {
            const categoryExits = categories.some(
                (cat) => cat._id === cotegoryFromUrl
            );

            if (!categoryExits) {
                const categoryName = categories.find(
                    (cat) =>
                        cat.name.toLocaleLowerCase() === cotegoryFromUrl.toLocaleLowerCase()
                );
                if (categoryName) {
                    setCategory(cotegoryFromUrl);
                } else {
                    setInvalidCategory(cotegoryFromUrl);
                    setCategory("");
                }

            }
        }
    }, [searchParams, categories]);

    const fetchProducts = useCallback(async (loadMore = false) => {
        if (loadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        try {
            const params = new URLSearchParams();
            if (category) params.append("category", category);
            if (brand) params.append("brand", brand);
            if (search) params.append("search", search);
            if (priceRange) {
                params.append("priceMin", priceRange[0].toString());
                params.append("priceMax", priceRange[1].toString());
            }

            params.append("page", currentPage.toString());
            params.append("limit", productsPerPage.toString());
            params.append("sortOrder", sortOrder);

            const response: ProductsResponse = await fetchData(
                `/products?${params.toString()}`
            );
            setTotal(response?.total);
            if (loadMore) {
                setNewlyLoadedProducts(response.products);
                setProducts((prev) => [...prev, ...response.products]);
            } else {
                setNewlyLoadedProducts([]);
                setProducts(response.products);
            }
        } catch (error) {
            console.log("Failed to fetch products:", error);
            setTotal(0);
            if (!loadMore) {
                setProducts([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [category, brand, search, priceRange, sortOrder, productsPerPage, currentPage,]);

    useEffect(() => {
        fetchProducts();
        setCurrentPage(1);
    }, [category, brand, search, priceRange, sortOrder,]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchProducts(true);
        }
    }, [currentPage, fetchProducts]);

    useEffect(() => {
        if (newlyLoadedProducts.length > 0) {
            const timer = setTimeout(() => {
                setNewlyLoadedProducts([]);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [newlyLoadedProducts]);

    const totalPages = Math.ceil(total / productsPerPage);

    const hasMoreProducts = products.length < total && currentPage < totalPages;

    const priceRanges: [number, number][] = [
        [0, 20],
        [20, 50],
        [50, 100],
        [100, Infinity],
    ];

    const loadMoreProducts = () => {
        if (hasMoreProducts && !loadingMore) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const resetCategory = () => {
        setCategory("");
        setCurrentPage(1);
        setInvalidCategory("");
    };

    const resetBrand = () => {
        setBrand("");
        setCurrentPage(1);
    };

    const resetSearch = () => {
        setSearch("");
        setCurrentPage(1);
    };

    const resetPriceRange = () => {
        setPriceRange(null);
        setCurrentPage(1);
    };

    const resetSortOrder = () => {
        setSortOrder("asc");
        setCurrentPage(1);
    };

    const resetAllFilters = () => {
        setCategory("");
        setBrand("");
        setSearch("");
        setPriceRange(null);
        setSortOrder("asc");
        setCurrentPage(1);
        setInvalidCategory("");
    };

    return (
        <Container className="py-10">
            <div className='flex items-center justify-between mb-5'>
                <div>
                    <h2 className='text-2xl font-semibold'>Shop Products</h2>
                    <p className='text-babyshopBlack/70 font-medium'>
                        {loading
                            ? "Loading"
                            : `Showing ${products?.length} of ${total} products`}
                    </p>
                    {invalidCategory && (
                        <div className='mt-2  bg-yellow-50 border border-yellow-200 rounded-md py-1 px-2'>
                            <p className='text-sm text-yellow-800'>
                                Category &quot;{invalidCategory}&quot; not found. Showing all products instead
                            </p>
                        </div>
                    )}
                </div>
                {(category || brand || search || priceRange || sortOrder !== "asc") && <Button
                    variant={"outline"}
                    className='text-sm'
                    onClick={resetAllFilters}
                    disabled={loading}
                >
                    Reset All Filters</Button>}
            </div>
            <div className="flex flex-col md:flex-row gap-5">
                <div className='p-5 bg-babyshopWhite w-full md:max-w-64 min-w-60 rounded-lg border'>
                    {/* Small devices */}
                    <div className="md:hidden">
                        <Button
                            variant="outline"
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="w-full mb-4 flex items-center justify-between"
                        >
                            <span className="font-medium">Filters</span>
                            {isFiltersOpen ? (
                                <ChevronUp size={20} />
                            ) : (
                                <ChevronDown size={20} />
                            )}
                        </Button>
                    </div>
                    <div
                        className={`${isFiltersOpen ? "block" : "hidden"
                            } md:block space-y-4`}
                    >
                        {/* Search */}
                        {search && (
                            <div>
                                <h3 className='text-sm font-medium mb-3'>Search</h3>
                                <div className='flex flex-wrap gap-2'>
                                    <span className='inline-flex items-center px-3 py-1
                                      rounded-full text-sm bg-blue-50 text-blue-700 border 
                                      border-blue-200'>
                                        `&quot;`{search} `&quot;`
                                        <button
                                            onClick={resetSearch}
                                            className='ml-2 text-blue-500 hover:text-blue-700'
                                            disabled={loading}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* category */}
                        <div className='mb-4'>
                            <div className='flex justify-between items-center'>
                                <label className='block text-sm font-medium mb-2'>Category</label>
                                {category && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={resetCategory}
                                        disabled={loading}
                                        className='text-xs text-blue-600 p-0'
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                            <Select
                                value={category || "All"}
                                onValueChange={(value) => {
                                    setCategory(value === "All" ? "" : value);
                                    setCurrentPage(1);
                                    setInvalidCategory("");
                                }}
                                disabled={loading}
                            >
                                <SelectTrigger className='w-full p-2 border rounded-md'>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categories</SelectLabel>
                                        <SelectItem value='All'>All Categories</SelectItem>
                                        {categories?.map((cat: Category) => (
                                            <SelectItem key={cat?._id} value={cat?._id}>{cat?.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* brands */}
                        <div className='mb-4'>
                            <div className='flex justify-between items-center'>
                                <label className='block text-sm font-medium mb-2'>Brand</label>
                                {brand && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={resetBrand}
                                        disabled={loading}
                                        className='text-xs text-blue-600 p-0'
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                            <Select
                                value={brand || "All"}
                                onValueChange={(value) => {
                                    setBrand(value === "All" ? "" : value);
                                    setCurrentPage(1);
                                }}
                                disabled={loading}
                            >
                                <SelectTrigger className='w-full p-2 border rounded-md'>
                                    <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Brands</SelectLabel>
                                        <SelectItem value='All'>All Brands</SelectItem>
                                        {brands?.map((brd: Brand) => (
                                            <SelectItem key={brd?._id} value={brd?._id}>{brd?.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* price range */}
                        <div className='mb-4'>
                            <div className='flex justify-between items-center'>
                                <label className='block text-sm font-medium mb-2'>
                                    Prices Ranges
                                </label>
                                {priceRange && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={resetPriceRange}
                                        disabled={loading}
                                        className='text-xs text-blue-600 p-0'
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                            <Select
                                value={priceRange ? `${priceRange[0]}-${priceRange[1]}` : "All"}
                                onValueChange={(value) => {
                                    if (value === "All") {
                                        setPriceRange(null);
                                    } else {
                                        const [min, max] = value.split("-").map(Number);
                                        setPriceRange([min, max]);
                                    }
                                    setCurrentPage(1);
                                }}
                                disabled={loading}
                            >
                                <SelectTrigger className='w-full p-2 border rounded-md'>
                                    <SelectValue placeholder="Select price range " />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Price Ranges</SelectLabel>
                                        <SelectItem value='All'>All Prices</SelectItem>
                                        {priceRanges?.map(([min, max]) => (
                                            <SelectItem
                                                key={`${min}-${max}`}
                                                value={`${min}-${max}`}
                                            >
                                                ${min} - {max === Infinity ? "Above" : `$${max}`}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* sort filter */}
                        <div className='mb-4'>
                            <div className='flex justify-between items-center'>
                                <label className='block text-sm font-medium mb-2'>Sort By</label>
                                {sortOrder !== "asc" && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={resetSortOrder}
                                        disabled={loading}
                                        className='text-xs text-blue-600 p-0'
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                            <Select
                                value={sortOrder}
                                onValueChange={(value: "asc" | "desc") => {
                                    setSortOrder(value);
                                    setCurrentPage(1);
                                }}
                                disabled={loading}
                            >
                                <SelectTrigger className='w-full p-2 border rounded-md'>
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='asc'>Newest First</SelectItem>
                                    <SelectItem value='desc'>Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className='bg-babyshopWhite p-5 rounded-md w-full border'>
                    {loading ? (
                        <ShopSkeleton />
                    ) : (

                        products?.length > 0 ?

                            < div className='w-full'>
                                <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
                                    {products?.map((product, index) => {
                                        const isNewlyLoaded = newlyLoadedProducts.some(
                                            (newProduct) => newProduct._id === product._id
                                        );

                                        return (
                                            <div key={`${product?._id}-${index}`}
                                                className={`transition-all duration-700 ease-out ${isNewlyLoaded
                                                    ? "opacity-0 translate-y-8 scale-95"
                                                    : "opacity-100 translate-y-0 scale-100"
                                                    }`}
                                                style={{
                                                    transitionDelay: isNewlyLoaded
                                                        ? `${(index % 10) * 100}ms`
                                                        : "0ms",
                                                }}
                                            >
                                                <ProductCard product={product} />
                                            </div>
                                        );
                                    })}
                                </div>
                                {hasMoreProducts && (
                                    <div className="mt-6 flex flex-col items-center gap-4">
                                        <Button
                                            onClick={loadMoreProducts}
                                            disabled={loadingMore}
                                            variant={"outline"}
                                            className="w-full rounded-sm hover:bg-babyshopSky hover:text-babyshopWhite hoverEffect py-5 mt-2"
                                        >
                                            {loadingMore ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                "Load More Products"
                                            )}
                                        </Button>
                                    </div>
                                )}
                                {!hasMoreProducts &&
                                    products.length > 0 &&
                                    total > 0 &&
                                    !loadingMore && (
                                        <div className="text-center py-6 mt-6">
                                            <p className="text-gray-600 text-lg mb-2">
                                                🎉 You&apos;ve seen it all! No more products to show.
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                Showing all {products.length} products
                                            </p>
                                        </div>
                                    )}
                            </div>
                            : (
                                !loading && (
                                    <EmptyListDesign
                                        message='No products match to your selected filters'
                                        resetFilters={resetAllFilters}
                                    />
                                )
                            )
                    )}
                </div>
            </div>
        </Container >
    );
};

export default ShopPageClient;