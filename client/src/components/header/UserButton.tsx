"use client"
import { useUserStore } from '@/lib/store'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const UserButton = () => {
  const { isAuthenticated, authUser } = useUserStore();
  return (
    <Link
      href={isAuthenticated && authUser ? "/user/profile" : "/auth/signin"}
      className="flex items-center gap-2 group hover:text-babyshopSky hoverEffect"
    >
      {isAuthenticated && authUser ? (
        <span className="w-10 h-10 border rounded-full p-1 group-hover:border-babyshopSky hoverEffect">
          {authUser.avatar ? (
            <Image
              src={authUser.avatar}
              alt="userImage"
              width={100}
              height={100}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold">
              {authUser.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </span>
      ) : (
        <User size={30} />
      )}
      <div className='flex flex-col'>
        <p className="text-xs font-medium">Welcome</p>
        <p className="font-semibold text-sm">
          {isAuthenticated && authUser
            ? authUser.name || "My Profile"
            : "Sign in / Register"}
        </p>
      </div>
    </Link>
  )
}

export default UserButton
