"use client";

import React from "react";
import PageBreadcrumb from "../common/PageBreadcrumb";

interface PrivacyData {
  _id: string;
  introduction: { title: string; content: string };
  informationWeCollect: {
    title: string;
    personalInformation: { subtitle: string; items: string[] };
    usageInformation: { subtitle: string; items: string[] };
  };
  howWeUseYourInformation: { title: string; items: string[] };
  informationSharing: { title: string; content: string; items: string[] };
  dataSecurity: { title: string; content: string };
  yourRights: { title: string; items: string[] };
  cookies: { title: string; content: string };
  contactUs: {
    title: string;
    content: string;
    email: string;
    phone: string;
    address: string;
  };
  lastUpdated: string;
}

interface Props {
  data: PrivacyData[];
}

/* ── Sub-components ── */

const SectionBlock = ({
  index,
  total,
  icon,
  title,
  children,
}: {
  index: number;
  total: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border border-[#ededed] rounded-xl overflow-hidden mb-4 bg-white">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ededed] bg-[#fafafa]">
      <div className="w-8 h-8 rounded-lg border border-[#ededed] bg-white flex items-center justify-center text-babyshopBlack/50 flex-shrink-0">
        {icon}
      </div>
      <span className="text-[15px] font-medium text-babyshopBlack">{title}</span>
    </div>
    <div className="px-6 py-5">{children}</div>
    <div className="px-6 py-2.5 bg-[#fafafa] border-t border-[#ededed] text-xs text-babyshopBlack/30">
      Section {String(index).padStart(2, "0")} of {String(total).padStart(2, "0")}
    </div>
  </div>
);

const DotItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2 mb-1.5 text-sm text-babyshopBlack/70 leading-relaxed">
    <span className="w-1.5 h-1.5 rounded-full bg-babyshopBlack/25 flex-shrink-0 mt-[7px]" />
    {text}
  </div>
);

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2.5 px-4 py-2.5 border border-[#ededed] rounded-lg text-sm text-babyshopBlack/70">
    <svg className="w-4 h-4 text-babyshopSky flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {text}
  </div>
);

const toc = [
  { num: "01", label: "Information we collect" },
  { num: "02", label: "How we use it" },
  { num: "03", label: "Information sharing" },
  { num: "04", label: "Data security" },
  { num: "05", label: "Your rights" },
  { num: "06", label: "Cookies" },
];

/* ── Main Component ── */

const PrivacySection = ({ data }: Props) => {
  const privacy = data?.[0];
  if (!privacy) return null;

  const lastUpdated = privacy.lastUpdated
    ? new Date(privacy.lastUpdated).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  return (
    <div className="max-w-4xl mx-auto py-4">
      <PageBreadcrumb items={[{ label: "Home", href: "/" }]} currentPage="Privacy Policy" />
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-[#ededed] rounded-xl overflow-hidden mb-6">
        <div className="bg-[#fafafa] p-8 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 bg-babyshopSky/10 text-babyshopSky text-[11px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full w-fit">
            Privacy Policy
          </span>
          <h1 className="text-2xl md:text-3xl font-medium text-babyshopBlack leading-tight">
            {privacy.introduction.title}
          </h1>
          <div className="w-8 h-0.5 bg-[#dedede] rounded-full" />
          <p className="text-sm text-babyshopBlack/60 leading-relaxed">
            {privacy.introduction.content}
          </p>
          {lastUpdated && (
            <p className="text-xs text-babyshopBlack/35">Last updated: {lastUpdated}</p>
          )}
        </div>
        <div className="bg-white p-8 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-[#ededed]">
          <p className="text-sm font-medium text-babyshopBlack mb-1">What this policy covers</p>
          {[
            "How we collect and use your data",
            "Who we share your information with",
            "How we keep your data secure",
            "Your rights and how to exercise them",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-babyshopBlack/65">
              <span className="w-1.5 h-1.5 rounded-full bg-babyshopSky flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Table of Contents */}
      <div className="grid grid-cols-2 md:grid-cols-3 border border-[#ededed] rounded-xl overflow-hidden mb-6">
        {toc.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-4 py-3.5 bg-white text-sm font-medium text-babyshopBlack/60
              ${i % 3 !== 2 ? "border-r" : ""} 
              ${i < 3 ? "border-b" : ""} 
              border-[#ededed]`}
          >
            <span className="text-xs text-babyshopBlack/30 font-normal w-5">{item.num}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* 01 — Information We Collect */}
      <SectionBlock index={1} total={6} title={privacy.informationWeCollect.title}
        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="3" /><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /></svg>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#fafafa] rounded-lg p-4">
            <p className="text-[11px] font-medium tracking-widest uppercase text-babyshopBlack/35 mb-3">
              {privacy.informationWeCollect.personalInformation.subtitle}
            </p>
            {privacy.informationWeCollect.personalInformation.items.map((item, i) => (
              <DotItem key={i} text={item} />
            ))}
          </div>
          <div className="bg-[#fafafa] rounded-lg p-4">
            <p className="text-[11px] font-medium tracking-widest uppercase text-babyshopBlack/35 mb-3">
              {privacy.informationWeCollect.usageInformation.subtitle}
            </p>
            {privacy.informationWeCollect.usageInformation.items.map((item, i) => (
              <DotItem key={i} text={item} />
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* 02 — How We Use */}
      <SectionBlock index={2} total={6} title={privacy.howWeUseYourInformation.title}
        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {privacy.howWeUseYourInformation.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 bg-[#fafafa] rounded-lg text-sm text-babyshopBlack/70 leading-relaxed">
              <span className="text-xs text-babyshopBlack/30 font-medium min-w-[20px] flex-shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item}
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* 03 — Information Sharing */}
      <SectionBlock index={3} total={6} title={privacy.informationSharing.title}
        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" /></svg>}
      >
        <p className="text-sm text-babyshopBlack/65 leading-relaxed mb-4">
          {privacy.informationSharing.content}
        </p>
        <div className="flex flex-col gap-2">
          {privacy.informationSharing.items.map((item, i) => (
            <CheckItem key={i} text={item} />
          ))}
        </div>
      </SectionBlock>

      {/* 04 — Data Security */}
      <SectionBlock index={4} total={6} title={privacy.dataSecurity.title}
        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" /></svg>}
      >
        <div className="flex gap-3 items-start p-4 bg-[#fafafa] rounded-lg border-l-2 border-babyshopSky">
          <svg className="w-5 h-5 text-babyshopSky flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-babyshopBlack/70 leading-relaxed">
            {privacy.dataSecurity.content}
          </p>
        </div>
      </SectionBlock>

      {/* 05 — Your Rights */}
      <SectionBlock index={5} total={6} title={privacy.yourRights.title}
        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {privacy.yourRights.items.map((item, i) => (
            <CheckItem key={i} text={item} />
          ))}
        </div>
      </SectionBlock>

      {/* 06 — Cookies */}
      <SectionBlock index={6} total={6} title={privacy.cookies.title}
        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} strokeLinecap="round" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} strokeLinecap="round" /></svg>}
      >
        <p className="text-sm text-babyshopBlack/70 leading-relaxed">
          {privacy.cookies.content}
        </p>
      </SectionBlock>

      {/* Contact Us */}
      <div className="border border-[#ededed] rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ededed] bg-[#fafafa]">
          <div className="w-8 h-8 rounded-lg border border-[#ededed] bg-white flex items-center justify-center text-babyshopBlack/50">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <span className="text-[15px] font-medium text-babyshopBlack">{privacy.contactUs.title}</span>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-babyshopBlack/65 leading-relaxed mb-4">
            {privacy.contactUs.content}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Email", value: privacy.contactUs.email },
              { label: "Phone", value: privacy.contactUs.phone },
              { label: "Address", value: privacy.contactUs.address },
            ].map((item, i) => (
              <div key={i} className="bg-[#fafafa] rounded-lg p-4">
                <p className="text-[11px] font-medium tracking-widest uppercase text-babyshopBlack/35 mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-babyshopBlack">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PrivacySection;