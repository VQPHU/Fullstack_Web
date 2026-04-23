"use client";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLogo = async () => {
      try {
        const response = await fetchData<{ icons: WebsiteIcon[] }>(
          "/website-icons?category=Logo"
        );

        if (response?.icons?.length) {
          const activeLogo = response.icons
            .filter((icon) => icon.isActive)
            .sort((a, b) => a.order - b.order)[0];

          if (activeLogo?.imageUrl) {
            setLogoUrl(activeLogo.imageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch logo from admin", error);
      } finally {
        setLoading(false);
      }
    };

    getLogo();
  }, []);

  // ⏳ đang load → không render gì (hoặc skeleton)
  if (loading) return null;

  // ❌ không có logo từ admin → không hiển thị
  if (!logoUrl) return null;

  return (
    <Link href={"/"}>
      <Image
        src={logoUrl}
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