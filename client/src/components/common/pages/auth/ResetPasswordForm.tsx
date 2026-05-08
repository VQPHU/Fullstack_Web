"use client"
import React, { useState } from 'react'
import z from 'zod';
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import authApi from '@/lib/authApi';

const resetSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof resetSchema>;

interface ResetPasswordFormProps {
    email: string;
}

const ResetPasswordForm = ({ email }: ResetPasswordFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(resetSchema),
        defaultValues: { email, otp: "", newPassword: "", confirmPassword: "" },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await authApi.post("/api/auth/reset-password", {
                email: data.email,
                otp: data.otp,
                newPassword: data.newPassword,
            });
            if (!response.success) throw new Error(response.error?.message);
            
            toast.success("Password reset successfully!");
            router.push("/auth/signin");
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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
                            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                                {/* OTP */}
                                <FormField
                                    control={form.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                OTP Code
                                            </FormLabel>
                                            <FormControl>
                                                <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                                                    <Input
                                                        placeholder="Enter 6-digit code"
                                                        maxLength={6}
                                                        disabled={isLoading}
                                                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 tracking-widest text-center text-lg"
                                                        {...field}
                                                    />
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {/* New Password */}
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                New Password
                                            </FormLabel>
                                            <FormControl>
                                                <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
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

                                {/* Confirm Password */}
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
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

                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-lg transition-all duration-200"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <KeyRound size={16} /> Reset Password
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-500">
                            Didn't receive the OTP?{" "}
                            <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200">
                                Resend
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default ResetPasswordForm;