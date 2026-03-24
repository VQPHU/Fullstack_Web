"use client"
import { useUserStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import z, { email } from 'zod';
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define the schema for the form, including terms acceptance
const registerSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Confirm password is required"),
        role: z.literal("user"),
        termsAccepted: z.literal(true, {
            errorMap: () => ({
                message: "You must agree to the Privacy Policy and Terms of Use",
            }),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type FormData = z.infer<typeof registerSchema>;

const SignUpForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const { register } = useUserStore();

    const form = useForm<FormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
            termsAccepted: true,
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            // Combine firstName and lastName into a single name field for registration
            const registerData = {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                password: data.password,
                role: data.role,
            }
            await register(registerData);
            toast.success("Registration successful! Please sign in");
            router.push("/auth/signin");
        } catch (error) {
            console.log("Registration error:", error);
            toast.error("Registration failed. Please try again");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full px-4"
            >
                <Card className="w-full shadow-none border-0">
                    <CardContent>
                        <Form {...form}>
                            <form className="space-y-6"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    First Name
                                                </FormLabel>
                                                <FormControl>
                                                    <motion.div
                                                        whileFocus={{ scale: 1.02 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Input
                                                            placeholder="First name"
                                                            disabled={isLoading}
                                                            className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                            {...field}
                                                        />
                                                    </motion.div>
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    Last Name
                                                </FormLabel>
                                                <FormControl>
                                                    <motion.div
                                                        whileFocus={{ scale: 1.02 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Input
                                                            placeholder="Last name"
                                                            disabled={isLoading}
                                                            className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                            {...field}
                                                        />
                                                    </motion.div>
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <motion.div
                                                    whileFocus={{ scale: 1.02 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Input
                                                        placeholder="you@example.com"
                                                        type="email"
                                                        disabled={isLoading}
                                                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                        {...field}
                                                    />
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <motion.div
                                                    whileFocus={{ scale: 1.02 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Input
                                                        placeholder="••••••••"
                                                        type="password"
                                                        disabled={isLoading}
                                                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                        {...field}
                                                    />
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <motion.div
                                                    whileFocus={{ scale: 1.02 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Input
                                                        placeholder="••••••••"
                                                        type="password"
                                                        disabled={isLoading}
                                                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                        {...field}
                                                    />
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Role
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="User"
                                                    type="text"
                                                    disabled
                                                    className="border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    value="user"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="termsAccepted"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isLoading}
                                                    className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm text-gray-500 font-normal">
                                                I agree with the{" "}
                                                <Link
                                                    href="/privacy"
                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    Privacy Policy
                                                </Link>{" "}
                                                and{" "}
                                                <Link
                                                    href="/terms"
                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    Terms of Use
                                                </Link>
                                            </FormLabel>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-lg transition-all duration-200"
                                        disabled={isLoading || !form.watch("termsAccepted")}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8H4z"
                                                    />
                                                </svg>
                                                Creating account...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <UserPlus size={16} />
                                                Register
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{" "}
                            <Link
                                href="/auth/signin"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}

export default SignUpForm