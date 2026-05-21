"use client";

import React from "react";
import PageBreadcrumb from "../common/PageBreadcrumb";

// ── INTERFACES DEFINITIONS ──
interface WhyItem {
  _id: string;
  title: string;
  description: string;
}

interface AboutData {
  story: { title: string; content: string };
  mission: { title: string; content: string };
  whyChooseUs: { title: string; items: WhyItem[] };
  commitment: { title: string; content: string };
  _id: string;
}

interface AboutSectionProps {
  data: AboutData[];
}

// Bộ icon SVG đồng bộ cho phần Why Choose Us
const renderValueIcon = (index: number) => {
  const iconClass = "w-4 h-4 text-babyshopSky";
  switch (index) {
    case 0: // Premium Quality
      return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
    case 1: // Safety First
      return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
    case 2: // Fast Delivery
      return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    default: // Customer Support
      return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.757a1 1 0 00.707-1.707l-5.414-5.414a1 1 0 00-.707-.293V7a2 2 0 002 2zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  }
};

/* ── MAIN COMPONENT ── */
const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
  const about = data?.[0];
  if (!about) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-0 space-y-6 antialiased selection:bg-babyshopSky/20">
      
      {/* ── 01. STORY SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-babyShopLightWhite rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-babyshopBlack text-babyshopWhite p-8 flex flex-col justify-between gap-12 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-babyshopSky/[0.08] rounded-full blur-2xl pointer-events-none" />
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-babyshopSky mb-3 font-semibold">
              Est. with love & care
            </p>
            <h1 className="text-2.5xl md:text-3.5xl font-light leading-tight tracking-tight">
              {about.story.title}
            </h1>
          </div>
          <div className="w-12 h-0.5 bg-babyshopSky rounded-full" />
        </div>

        <div className="bg-babyshopLightBg/40 p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-babyShopLightWhite">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-babyshopSky mb-3.5">
            Our Story
          </h2>
          <p className="text-babyshopBlack/75 leading-relaxed text-sm">
            {about.story.content}
          </p>
        </div>
      </div>

      {/* ── 02. MISSION SECTION ── */}
      <div className="bg-white border border-babyShopLightWhite rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <span className="absolute -top-4 right-4 text-[9rem] leading-none text-babyshopLightBg/70 select-none font-serif pointer-events-none">
          “
        </span>
        <div className="relative z-10 space-y-2.5">
          <p className="text-[10px] tracking-[0.25em] uppercase text-babyshopSky font-semibold">
            Mission Statement
          </p>
          <p className="text-babyshopBlack/75 leading-relaxed text-sm max-w-2xl">
            {about.mission.content}
          </p>
        </div>
      </div>

      {/* ── 03. WHY CHOOSE US SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between mb-2 pb-3 border-b border-babyShopLightWhite px-1">
          <h2 className="text-lg font-semibold text-babyshopBlack tracking-tight">
            {about.whyChooseUs.title}
          </h2>
          <span className="text-[10px] tracking-[0.15em] uppercase text-babyshopTextLight/80 font-medium">
            Our Core Values
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {about.whyChooseUs.items.map((item, i) => (
            <div
              key={item._id}
              className="bg-white border border-babyShopLightWhite rounded-xl p-5 flex gap-4 items-start hover:border-babyshopSky/20 hover:bg-babyshopLightBg/20 transition-all duration-300 group"
            >
              <div className="w-8 h-8 rounded-lg bg-babyshopLightBg border border-babyShopLightWhite/80 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-babyshopSky/10 transition-colors duration-300">
                {renderValueIcon(i)}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold tracking-[0.05em] uppercase text-babyshopBlack">
                  {item.title}
                </h3>
                <p className="text-xs text-babyshopTextLight leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 04. COMMITMENT SECTION ── */}
      <div className="grid grid-cols-[auto_1fr] border border-babyShopLightWhite rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="bg-babyshopSky px-3.5 py-6 flex items-center justify-center shrink-0">
          <span
            className="text-white text-[10px] tracking-[0.3em] uppercase font-bold"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Our Commitment
          </span>
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-base font-semibold text-babyshopBlack tracking-tight mb-2">
            {about.commitment.title}
          </h2>
          <p className="text-xs text-babyshopBlack/70 leading-relaxed">
            {about.commitment.content}
          </p>
        </div>
      </div>

    </div>
  );
};

export default AboutSection;