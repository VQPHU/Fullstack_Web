import React from "react";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Title } from "./text";

interface Props {
  title: string;
  href: string;
  hrefTitle: string;
}

const SectionView = ({ title, href, hrefTitle }: Props) => {
  return (
    <div className="flex items-center gap-5 justify-between">
      <Title className="text-xl">{title}</Title>
      <Link
        href={href}
        className="text-babyshopSky text-sm font-medium hover:text-babyshopRed hoverEffect"
      >
        <p className="flex items-center gap-0.5">
          {hrefTitle} <ChevronRight size={18} />
        </p>
      </Link>
    </div>
  );
};

export default SectionView;
