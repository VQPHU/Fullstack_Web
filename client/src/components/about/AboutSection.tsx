"use client";

import React from "react";

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

const icons = ["◈", "✦", "⬡", "◉"];

const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
  const about = data?.[0];
  if (!about) return null;

  return (
    <div className="space-y-8 py-4">

      {/* Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-[#ededed] rounded-xl overflow-hidden">
        <div className="bg-babyshopBlack text-babyshopWhite p-8 flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-babyshopSky mb-3">
              Est. with love & care
            </p>
            <h1 className="text-3xl md:text-4xl font-light leading-tight">
              {about.story.title}
            </h1>
          </div>
          <div className="w-10 h-px bg-babyshopSky" />
        </div>
        <div className="bg-babyShopLightWhite p-8 flex flex-col justify-center">
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-babyshopSky mb-3">
            Our Story
          </h2>
          <p className="text-babyshopBlack/80 leading-relaxed text-sm">
            {about.story.content}
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="bg-white border border-[#ededed] rounded-xl p-8 relative overflow-hidden">
        <span className="absolute top-0 right-4 text-[8rem] leading-none text-[#ededed] select-none font-serif pointer-events-none">
          "
        </span>
        <p className="text-xs tracking-[0.2em] uppercase text-babyshopSky mb-4">
          Mission Statement
        </p>
        <p className="text-babyshopBlack/80 leading-relaxed text-sm max-w-2xl relative z-10">
          {about.mission.content}
        </p>
      </div>

      {/* Why Choose Us */}
      <div>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#ededed]">
          <h2 className="text-xl font-light text-babyshopBlack">
            {about.whyChooseUs.title}
          </h2>
          <span className="text-xs tracking-[0.15em] uppercase text-babyshopTextLight">
            Our values
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#ededed] border border-[#ededed] rounded-xl overflow-hidden">
          {about.whyChooseUs.items.map((item, i) => (
            <div
              key={item._id}
              className="bg-white p-6 flex gap-4 items-start hover:bg-babyShopLightWhite transition-colors duration-300"
            >
              <span className="text-babyshopSky text-lg flex-shrink-0 mt-0.5">
                {icons[i] ?? "✦"}
              </span>
              <div>
                <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-babyshopBlack mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-babyshopTextLight leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commitment */}
      <div className="grid grid-cols-[auto_1fr] border border-[#ededed] rounded-xl overflow-hidden">
        <div className="bg-babyshopSky px-4 py-8 flex items-center justify-center">
          <span
            className="text-white text-xs tracking-[0.25em] uppercase font-medium"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Our Commitment
          </span>
        </div>
        <div className="bg-white p-8">
          <h2 className="text-lg font-light text-babyshopBlack mb-3">
            {about.commitment.title}
          </h2>
          <p className="text-sm text-babyshopBlack/75 leading-relaxed">
            {about.commitment.content}
          </p>
        </div>
      </div>

    </div>
  );
};

export default AboutSection;