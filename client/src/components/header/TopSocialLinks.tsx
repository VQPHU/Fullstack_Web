"use client";

import { Facebook, Instagram, Linkedin, Twitter, Youtube, Send, MessageCircle, Globe, Share2, Filter } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { fetchData } from '@/lib/api';

interface SocialMedia {
  _id: string;
  name: string;
  platform: string;
  url: string;
  isActive: boolean;
  order: number;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Facebook": return <Facebook size={16} />;
    case "Instagram": return <Instagram size={16} />;
    case "Twitter": return <Twitter size={16} />;
    case "LinkedIn": return <Linkedin size={16} />;
    case "YouTube": return <Youtube size={16} />;
    case "TikTok": return <Share2 size={16} />;
    case "Pinterest": return <Filter size={16} />;
    case "WhatsApp": return <MessageCircle size={16} />;
    case "Telegram": return <Send size={16} />;
    default: return <Globe size={16} />;
  }
};

const TopSocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState<SocialMedia[]>([]);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetchData<{ socialMediaLinks: SocialMedia[] }>("/social-media");
        if (response?.socialMediaLinks) {
          // Lọc các link đang hoạt động và sắp xếp theo thứ tự (order)
          const activeLinks = response.socialMediaLinks
            .filter((item) => item.isActive)
            .sort((a, b) => a.order - b.order);
          setSocialLinks(activeLinks);
        }
      } catch (error) {
        console.error("Failed to fetch social links", error);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="flex items-center gap-3">
      {socialLinks.map((item) => (
        <Link
          key={item._id}
          href={item.url}
          target="_blank"
          className="hover:text-babyshopWhite hoverEffect"
          title={item.name}
        >
          {getPlatformIcon(item.platform)}
        </Link>
      ))}
    </div>
  );
};

export default TopSocialLinks
