"use client"
import { fetchData } from '@/lib/api';
import { Brand, Category, Product } from '@/types/type';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'
import Container from "@/components/common/container";

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
            <div>
                <div>
                    <h2>Shop Products</h2>
                    <p>
                        {loading
                            ? "Loading"
                            : `Showing ${products?.length} of ${total} products`}
                    </p>
                </div>
            </div>
            <div className="flex">
                <div>Sidebar</div>
                <div>products</div>
            </div>
        </Container>
    );
};

export default ShopPageClient;