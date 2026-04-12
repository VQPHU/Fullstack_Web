"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  Heart,
  Bell,
  ShoppingBag,
  Settings,
  LogOut,
} from "lucide-react"

import { useUserStore } from "@/lib/store"
import authApi from "@/lib/authApi"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"

const UserButton = () => {
  const { isAuthenticated, authUser, logoutUser } = useUserStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await authApi.post("/auth/logout", {})
    logoutUser()
    router.push("/")
  }

  return (
    <Link
      href={isAuthenticated && authUser ? "/user/profile" : "/auth/signin"}
      className="flex items-center gap-2 group hover:text-babyshopSky hoverEffect"
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        {/* Trigger */}
        <DropdownMenuTrigger asChild>
          <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 group">
              {isAuthenticated && authUser ? (
                <div className="w-10 h-10 rounded-full border p-[2px] group-hover:border-teal-500 transition">
                  {authUser.avatar ? (
                    <Image
                      src={authUser.avatar}
                      alt="avatar"
                      width={100}
                      height={100}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                      {authUser.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              ) : (
                <User size={28} />
              )}

              <div className='flex flex-col'>
                <p className="text-xs font-medium">Welcome</p>
                <p className="font-semibold text-sm">
                  {isAuthenticated && authUser
                    ? authUser.name || "My Profile"
                    : "Sign in / Register"}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>

        {/* Dropdown */}
        {isAuthenticated && authUser && (
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] rounded-xl border bg-white shadow-lg p-0 overflow-hidden"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {/* Header */}
            <div className="px-4 py-3">
              <p className="font-semibold text-gray-900">
                {authUser.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {authUser.email}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Menu */}
            <div className="py-2">
              <MenuItem href="/user/profile" icon={<User size={18} />}>
                My Profile
              </MenuItem>

              <MenuItem href="/user/orders" icon={<Package size={18} />}>
                Orders
              </MenuItem>

              <MenuItem href="/user/wishlist" icon={<Heart size={18} />}>
                Wishlist
              </MenuItem>

              <MenuItem href="/user/analytics" icon={<Bell size={18} />}>
                Notifications
              </MenuItem>

              <MenuItem href="/shop" icon={<ShoppingBag size={18} />}>
                Continue Shopping
              </MenuItem>

              <MenuItem icon={<Settings size={18} />}>
                Settings
              </MenuItem>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Logout */}
            <div className="p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </Link>
  )
}

export default UserButton

// Reusable item
interface MenuItemProps {
  children: React.ReactNode
  icon: React.ReactNode
  href?: string
}

const MenuItem = ({ children, icon, href }: MenuItemProps) => {
  const content = (
    <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer">
      <span className="text-gray-500">{icon}</span>
      {children}
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>

  return content
}