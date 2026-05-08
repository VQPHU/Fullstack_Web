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
import { Mail } from 'lucide-react';
import authApi from '@/lib/authApi';

const forgotSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof forgotSchema>;

type Props = {
    onSuccess: (email: string) => void;
}

const ForgotPasswordForm = ({ onSuccess }: Props) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await authApi.post("/api/auth/forgot-password", { email: data.email });
            if (!response.success) throw new Error(response.error?.message);
            
            toast.success("OTP has been sent to your email");
            onSuccess(data.email); 
        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP. Please try again");
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
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Email Address
                                            </FormLabel>
                                            <FormControl>
                                                <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
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
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Mail size={16} /> Send OTP
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-500">
                            Remember your password?{" "}
                            <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordForm;