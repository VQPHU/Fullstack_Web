"use client";
import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="relative group cursor-pointer rounded-xl overflow-hidden border border-babyshopTextLight/30"
        onClick={() => setIsOpen(true)}
      >
        <Image src={src} alt={alt} width={500} height={500} className="w-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full">
            Click to view full size
          </span>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <Image
              src={src}
              alt={alt}
              width={900}
              height={900}
              className="max-h-[90vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImage;