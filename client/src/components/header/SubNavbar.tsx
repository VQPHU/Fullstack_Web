"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, BarChart3, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const AccountHeader = () => {
    const pathname = usePathname();

    const navItems = [
        { label: "Profile", icon: <User size={18} />, href: "/user/profile" },
        { label: "Orders", icon: <Package size={18} />, href: "/user/orders" },
        { label: "Analytics", icon: <BarChart3 size={18} />, href: "/user/analytics" },
        { label: "Notifications", icon: <Bell size={18} />, href: "/notifications" },
        { label: "Settings", icon: <Settings size={18} />, href: "/settings" },
    ];

    return (
        <div className="space-y-8 bg-[#f8fafc]/30">
            {/* 1. Header Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
                    My Account
                </h1>
                <p className="text-[15px] text-slate-500">
                    Manage your account, orders, and preferences
                </p>
            </div>

            {/* 2. Navigation Bar Section */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center">
                <div className="flex items-center gap-2">
                    {navItems.map((item) => {
                        // Giả sử Profile đang active như trong ảnh
                        const isActive = item.label === "Profile";


                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-xl",
                                    isActive
                                        ? "bg-[#2eb8ac] text-white shadow-md shadow-[#2eb8ac]/20" // Active: Màu xanh lục
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-transparent" // Bình thường: Trong suốt, Hover: Xám nhạt
                                )}
                            >
                                <span className={isActive ? "text-white" : "text-slate-500"}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AccountHeader;