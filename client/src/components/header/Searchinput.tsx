"use client"
import React, { useState } from 'react'
import { Input } from '../ui/input';
import { Search, X } from 'lucide-react';

const Searchinput = () => {
    const [search, setSearch] = useState("");
    // const [debouncedSearch] = useDebounce(search, 300);
    // const [products, setProducts] = useState<Product[]>([]);
    // const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    // const [showResults, setShowResults] = useState(false);
    // const [showSearch, setShowSearch] = useState(false);
    // const searchRef = useRef<HTMLDivElement>(null);
    // const mobileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative lg:w-full">
            <form
                className="relative hidden lg:flex items-center"
            >
                <Input
                    placeholder="Search Products..."
                    className="flex-1 rounded-md py-5 focus-visible:ring-0 focus-visible:border-babyshopRed
                     bg-white text-babyshopText placeholder:font-semibold placeholder:tracking-wide pr-16"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
        </div>
    );
};

export default Searchinput
