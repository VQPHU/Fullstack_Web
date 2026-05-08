"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ForgotPasswordForm from '@/components/common/pages/auth/ForgotPasswordForm'
import ResetPasswordForm from '@/components/common/pages/auth/ResetPasswordForm'

const ForgotPasswordPage = () => {
    const [step, setStep] = useState<"forgot" | "reset">("forgot")
    const [email, setEmail] = useState("")

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    {step === "forgot" ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
                            <p className="text-gray-500 mt-2 text-sm">
                                Enter your email to receive an OTP code
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
                            <p className="text-gray-500 mt-2 text-sm">
                                Enter the OTP code sent to <span className="text-indigo-600 font-medium">{email}</span>
                            </p>
                        </>
                    )}
                </motion.div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`h-2 w-16 rounded-full transition-all duration-300 ${step === "forgot" ? "bg-indigo-600" : "bg-indigo-200"}`} />
                    <div className={`h-2 w-16 rounded-full transition-all duration-300 ${step === "reset" ? "bg-indigo-600" : "bg-gray-200"}`} />
                </div>

                {step === "forgot" ? (
                    <ForgotPasswordForm onSuccess={(email) => { setEmail(email); setStep("reset"); }} />
                ) : (
                    <ResetPasswordForm email={email} />
                )}
            </div>
        </div>
    )
}

export default ForgotPasswordPage