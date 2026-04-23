"use client";

import { logo as defaultLogo } from "../../assets/image";
import { cn } from "../../lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/lib/api";

interface WebsiteIcon {
  category: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
}

const Logo = ({ className }: { className?: string }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const getLogo = async () => {
      try {
        // Gọi API lấy icons với category là Logo
        const response = await fetchData<{ icons: WebsiteIcon[] }>("/website-icons?category=Logo");
        if (response?.icons) {
          // Lọc icon đang hoạt động và lấy cái có thứ tự (order) nhỏ nhất
          const activeLogo = response.icons
            .filter((icon) => icon.isActive)
            .sort((a, b) => a.order - b.order)[0];

          if (activeLogo?.imageUrl) {
            setLogoUrl(activeLogo.imageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch logo from admin", error);
      }
    };
    getLogo();
  }, []);

  return (
    <Link href={"/"}>
      <Image
        src={logoUrl || defaultLogo}
        alt="logo"
        width={200}
        height={60}
        priority
        className={cn("w-32 lg:w-44 h-auto object-contain", className)}
      />
    </Link>
  );
};

export default Logo;
