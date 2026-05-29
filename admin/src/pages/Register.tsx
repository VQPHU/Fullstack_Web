"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import useAuthStore from "@/store/useAuthStore";
import { motion } from "motion/react";
import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { registerSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";

type FormData = z.infer<typeof registerSchema>

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const emailValue = form.watch("email");
  const [debouncedEmail] = useDebounce(emailValue, 800);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!debouncedEmail || !emailRegex.test(debouncedEmail)) {
      setEmailError(null);
      return;
    }

    const verifyEmail = async () => {
      setIsVerifyingEmail(true);
      setEmailError(null);
      try {
        const res = await fetch(
          `https://emailreputation.abstractapi.com/v1/?api_key=${import.meta.env.VITE_ABSTRACT_EMAIL_API_KEY}&email=${encodeURIComponent(debouncedEmail)}`
        );
        const data = await res.json();

        const isDeliverable = data?.email_deliverability?.status === "deliverable";
        const isMxValid = data?.email_deliverability?.is_mx_valid === true;
        const isDisposable = data?.email_quality?.is_disposable === true;

        if (isDisposable) {
          setEmailError("Disposable emails are not allowed.");
        } else if (!isDeliverable || !isMxValid) {
          setEmailError("This email does not appear valid or deliverable.");
        } else {
          setEmailError(null);
        }
      } catch (err) {
        console.error("Email verification error:", err);
        // Không block user nếu API lỗi
      } finally {
        setIsVerifyingEmail(false);
      }
    };

    verifyEmail();
  }, [debouncedEmail]);

  const onsubmit = async (data: FormData) => {
    if (emailError) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    try {
      await register(data);
      navigate("/login");
    } catch (error) {
      console.error("Registration Failed");
      toast.error("Failed to Register!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 
    to-pink-500 flex items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md px-4">
        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200">
          <CardHeader className="text-center space-y-2">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
              <CardTitle className="text-3xl font-bold text-gray-800">Create an Account</CardTitle>
              <CardDescription className="text-gray-500">Enter your details to sign up</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" type="text" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            disabled={isLoading}
                            className={emailError ? "border-red-500 pr-10" : "pr-10"}
                            {...field}
                          />
                          {isVerifyingEmail && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                      {emailError && !isVerifyingEmail && (
                        <p className="text-red-500 text-xs mt-1">{emailError}</p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input placeholder="*********" type="password" disabled={isLoading} {...field} />
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
                      <FormLabel className="text-sm font-medium text-gray-700">Role</FormLabel>
                      <FormControl>
                        <Input placeholder="User" type="text" disabled value="user" className="bg-gray-100 text-gray-500 cursor-not-allowed" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading || isVerifyingEmail || !!emailError}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><UserPlus size={16} /> Sign Up</span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;