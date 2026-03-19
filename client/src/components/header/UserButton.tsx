import { User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const UserButton = () => {
  return (
    <Link href={"/auth/signin"}
      className='flex items-center gap-2 group hover:text-babyshopSky hoverEffect'>
      <User size={30} />
      <span className='flex flex-col'>
        <span className='text-xs font-medium'>Welcome</span>
        <span className='font-semibold text-sm'>Sign in / Register</span>
      </span>
    </Link>
  )
}

export default UserButton
