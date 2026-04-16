"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Phone,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchData } from "@/lib/api";

// ===== Types =====
interface Category {
  _id: string;
  name: string;
}

interface CategoriesResponse {
  categories: Category[];
}

export default function NotFoundPageClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchData<CategoriesResponse>("/categories");
        setCategories(data.categories.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-lg bg-white">

        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-8 px-6">
          <div className="text-4xl mb-2">👶❓</div>
          <h1 className="text-3xl font-bold">Oops! Page Not Found</h1>
          <p className="text-sm mt-2 opacity-90">
            This little one seems to have wandered off to playtime!
          </p>
          <p className="text-sm opacity-90">
            Don't worry, we'll help you find what you're looking for.
          </p>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-6 text-center">

          {/* Button */}
          <Button
            onClick={() => router.push("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 mb-4"
          >
            Return to Home
          </Button>

          <p className="text-sm text-gray-500 mb-6">
            Or explore our amazing collection of baby products below
          </p>

          {/* ===== QUICK LINKS ===== */}
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

            <Link href="/shop">
              <div className="border rounded-xl p-4 hover:shadow cursor-pointer text-center">
                <ShoppingBag className="mx-auto mb-2" />
                <p className="text-sm">Shop All Products</p>
              </div>
            </Link>

            <Link href="/user/wishlist">
              <div className="border rounded-xl p-4 hover:shadow cursor-pointer text-center">
                <Heart className="mx-auto mb-2" />
                <p className="text-sm">Wishlist</p>
              </div>
            </Link>

            <div className="border rounded-xl p-4 opacity-60 text-center">
              <Phone className="mx-auto mb-2" />
              <p className="text-sm">Contact Support</p>
            </div>

          </div>

          {/* ===== CATEGORIES ===== */}
          <h3 className="font-semibold mb-3">Popular Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 ">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${cat._id}`}
              >
                <div className="border rounded-full py-2 text-sm hover:bg-gray-100 cursor-pointer">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>

          {/* ===== NEED HELP ===== */}
          <h3 className="font-semibold mb-3">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {[
              "Track Your Order",
              "Returns & Exchanges",
              "Shipping Information",
              "Customer Reviews",
            ].map((item, i) => (
              <Link key={i} href="#">
                <div className="border border-green-400 text-green-600 rounded-lg py-2 flex items-center justify-center gap-2 text-sm hover:bg-green-50 cursor-pointer">
                  <ArrowLeft size={14} />
                  {item}
                </div>
              </Link>
            ))}
          </div>

          {/* ===== FOOTER ===== */}
          <div className="border-t pt-4 text-center text-sm text-gray-600">
            <h4 className="font-semibold">
              Welcome to Babyshop - Your Trusted Baby Store
            </h4>
            <p className="text-xs mt-2">
              We're your one-stop destination for everything your little one needs.
            </p>

            <div className="flex justify-center gap-4 mt-3 text-xs">
              <span>Customer Support</span>
              <span>24/7 Available</span>
              <span>Free Shipping</span>
            </div>

            <div className="mt-3 text-xs">
              <span className="text-blue-600 cursor-pointer">Privacy Policy</span>{" "}
              •{" "}
              <span className="text-blue-600 cursor-pointer">Terms of Service</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
