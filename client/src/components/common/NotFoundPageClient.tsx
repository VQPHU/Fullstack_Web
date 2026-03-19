"use client";
import { useRouter } from "next/navigation";
import { Frown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotFoundPageClient = () => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl px-4"
      >
        <Card className="w-full shadow-none border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Frown className="mx-auto h-16 w-16 text-indigo-600" />
              <CardTitle className="text-3xl font-bold text-gray-800 mt-4">
                404 - Page Not Found
              </CardTitle>
              <CardDescription className="text-gray-500">
                Oops! Looks like this page wandered off to nap time.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Welcome to{" "}
              <span className="font-semibold">
                Babyshop | Online shopping places
              </span>
              , your one-stop destination for all things baby! From adorable
              clothes to essential gear, we make shopping for your little one a
              breeze. Unfortunately, the page you’re looking for isn’t here, but
              don’t worry—we’ve got plenty to explore!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-lg transition-all duration-200"
              >
                Return to Home
              </Button>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-500">Explore more of Babyshop:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm transition-all duration-200"
              >
                Shop Products
              </Link>
              <Link
                href="/user/cart"
                className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm transition-all duration-200"
              >
                View Cart
              </Link>
              <Link
                href="/auth/signup"
                className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm transition-all duration-200"
              >
                Sign Up
              </Link>
              <Link
                href="/auth/signin"
                className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
            <CardDescription className="text-sm text-gray-600 mt-4 max-w-md text-center">
              <h3 className="font-semibold mb-2">Our Commitment</h3>
              <p>
                At Babyshop, we prioritize your privacy and security. Your data
                is encrypted and never shared without consent. Learn more in our{" "}
              </p>
              <Link
                href="/privacy"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Privacy Policy
              </Link>
            </CardDescription>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFoundPageClient;
