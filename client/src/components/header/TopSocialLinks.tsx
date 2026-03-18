import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const socialLinks = [
  { title: "Facebook", icon: <Facebook size={16} />, href: "/" },
  { title: "Instagram", icon: <Instagram size={16} />, href: "/" },
  { title: "Linkedin", icon: <Linkedin size={16} />, href: "/" },
  { title: "Twitter", icon: <Twitter size={16} />, href: "/" },
];
const TopSocialLinks = () => {
  return (
    <div className="flex items-center gap-3">
      {socialLinks?.map((item) => (
        <Link
          key={item?.title}
          href={item?.href}
          className="hover:text-babyshopWhite hoverEffect"
        >
          {item?.icon}
        </Link>
      ))}
    </div>
  );
};

export default TopSocialLinks
