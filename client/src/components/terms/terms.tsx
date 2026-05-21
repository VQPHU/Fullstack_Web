"use client";

import React from "react";
import PageBreadcrumb from "../common/PageBreadcrumb";

// ── INTERFACE ĐỊNH NGHĨA THEO SCHEMA MONGOOSE ──
interface TermsConditionsData {
  _id?: string;
  acceptanceOfTerms: { title: string; content: string };
  useLicense: { title: string; content: string; items: string[] };
  productInformation: { title: string; content: string };
  pricingAndPayment: { title: string; content: string; items: string[] };
  shippingAndDelivery: { title: string; content: string };
  returnsAndExchanges: { title: string; content: string; items: string[] };
  accountRegistration: { title: string; content: string };
  limitationOfLiability: { title: string; content: string };
  privacyPolicy: { title: string; content: string };
  governingLaw: { title: string; content: string };
  contactInformation: {
    title: string;
    content: string;
    email: string;
    phone: string;
    address: string;
  };
  lastUpdated: string;
}

// ── SUB-COMPONENTS TÁI SỬ DỤNG ──
const TermSectionCard = ({
  index,
  title,
  icon,
  children,
}: {
  index: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="relative overflow-hidden bg-white border border-babyShopLightWhite rounded-2xl p-6 md:p-8 hover:border-babyshopSky/30 transition-all duration-300 group">
    <div className="absolute right-4 bottom-0 text-7xl font-bold text-babyshopBlack/[0.03] select-none pointer-events-none group-hover:text-babyshopSky/[0.05] transition-colors duration-300">
      {String(index).padStart(2, "0")}
    </div>
    <div className="flex items-center gap-3.5 mb-5">
      <div className="w-9 h-9 rounded-xl border border-babyShopLightWhite bg-babyshopLightBg flex items-center justify-center text-babyshopBlack/60 group-hover:bg-babyshopSky/10 group-hover:text-babyshopSky transition-colors duration-300 flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-babyshopBlack tracking-tight">
        {title}
      </h2>
    </div>
    <div className="relative z-10 text-sm text-babyshopBlack/70 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

const ListItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3 text-sm text-babyshopBlack/75 bg-babyshopLightBg/60 border border-babyShopLightWhite/50 rounded-xl px-4 py-3 hover:bg-white hover:border-babyShopLightWhite transition-all duration-200">
    <div className="w-5 h-5 rounded-md bg-babyshopSky/10 text-babyshopSky flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold">
      ✓
    </div>
    <span className="leading-relaxed">{text}</span>
  </div>
);

// ── MOCK DATA MẪU (Sẽ thay bằng data thật từ API của bạn) ──
const mockData: TermsConditionsData = {
  acceptanceOfTerms: {
    title: "1. Acceptance of Terms",
    content: "By accessing and using Babyshop platforms, you acknowledge that you have read, understood, and agreed to be legally bound by these entire Terms and Conditions, as well as our standard operating guidelines."
  },
  useLicense: {
    title: "2. Use License",
    content: "We grant you a limited, non-exclusive, non-transferable, and revocable license to access and make personal use of our retail shopping services under the following strict boundaries:",
    items: [
      "Commercial reproduction or resale of any website materials is strictly prohibited.",
      "Modification or copying of underlying source codes and product media is not allowed.",
      "Users must not use the platform for any fraudulent or harmful digital actions."
    ]
  },
  productInformation: {
    title: "3. Product Information & Accuracy",
    content: "We strive to display our children products, descriptions, colors, and sizing as accurately as possible. However, slight variations may occur based on digital screen settings or sudden supplier updates."
  },
  pricingAndPayment: {
    title: "4. Pricing and Payment Terms",
    content: "All listed store prices are inclusive of standard local taxes unless explicitly stated otherwise during the checkout progress.",
    items: [
      "We securely process online credit cards, digital banking transfers, and cash-on-delivery options.",
      "Babyshop reserves the distinct right to adjust retail pricing structures without prior notifications.",
      "Orders with clear system pricing glitches may be canceled and refunded by management immediately."
    ]
  },
  shippingAndDelivery: {
    title: "5. Shipping and Delivery Details",
    content: "Estimated package shipping windows are calculated automatically during checkout processes. While we partner with premium carriers to guarantee fast deliveries, unexpected regional delays may occasionally occur."
  },
  returnsAndExchanges: {
    title: "6. Returns and Exchanges Policy",
    content: "We deeply care about your ultimate satisfaction with your family's purchases. Unused products are eligible for adjustments if they meet the core safety requirements:",
    items: [
      "Items must remain completely unwashed, unworn, and have all original price tags intact.",
      "Return packages must be officially initiated within exactly 7 days of successful delivery receipts.",
      "Specific hygiene items or final sales clearing categories are strictly non-refundable."
    ]
  },
  accountRegistration: {
    title: "7. Account Registration Security",
    content: "Users creating personalized platform accounts are fully responsible for maintaining secure passwords. Any actions, orders, or profile changes conducted under your account are legally recognized as your own."
  },
  limitationOfLiability: {
    title: "8. Limitation of Liability Clauses",
    content: "Under no standard circumstances shall Babyshop or its manufacturing suppliers be held liable for any direct, indirect, incidental, or consequential electronic damages resulting from your inability to access our online servers safely."
  },
  privacyPolicy: {
    title: "9. Linked Privacy Policy Overview",
    content: "Your submitted private data, dynamic location tags, and payment details are strictly processed according to our official Privacy Policy guidelines. Using this web application represents compliance with that secure workflow."
  },
  governingLaw: {
    title: "10. Governing Law & Jurisdiction",
    content: "These legal operational agreements and all associated sales processes shall be strictly governed and interpreted in accordance with the sovereign country laws governing our headquarters location."
  },
  contactInformation: {
    title: "Contact Legal Operations",
    content: "If you have any remaining technical questions, custom requests, or structural disputes regarding our official terms, feel free to directly reach our operational support agents through these verified channels:",
    email: "legal@babyshop.com",
    phone: "+84 (024) 123-4567",
    address: "123 Innovation Street, Floor 4, Hanoi, Vietnam"
  },
  lastUpdated: "2026-05-21T00:00:00.000Z"
};

/* ── MAIN COMPONENT ── */
const PageTerms = () => {
  // Thay thế mockData bằng dữ liệu state của bạn nếu fetch từ API
  const terms = mockData;

  const formattedDate = terms.lastUpdated
    ? new Date(terms.lastUpdated).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const tableOfContents = [
    { id: "acceptance", label: terms.acceptanceOfTerms.title },
    { id: "license", label: terms.useLicense.title },
    { id: "products", label: terms.productInformation.title },
    { id: "pricing", label: terms.pricingAndPayment.title },
    { id: "shipping", label: terms.shippingAndDelivery.title },
    { id: "returns", label: terms.returnsAndExchanges.title },
    { id: "account", label: terms.accountRegistration.title },
    { id: "liability", label: terms.limitationOfLiability.title },
    { id: "privacy", label: terms.privacyPolicy.title },
    { id: "law", label: terms.governingLaw.title },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-0 space-y-6 antialiased selection:bg-babyshopSky/20">
      <PageBreadcrumb items={[{ label: "Home", href: "/" }]} currentPage="Terms & Conditions  " />

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden border border-babyShopLightWhite rounded-2xl bg-gradient-to-br from-babyshopLightBg via-white to-white p-8 md:p-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-babyshopSky/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center bg-babyshopSky/10 text-babyshopSky text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
            Legal Agreements
          </span>
          <h1 className="text-2xl md:text-3.5xl font-bold text-babyshopBlack tracking-tight leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-babyshopTextLight leading-relaxed">
            Please read these terms and conditions carefully before using our service. By accessing or using the platform, you agree to be bound by these terms.
          </p>
          {formattedDate && (
            <p className="text-xs text-babyshopTextLight/80 pt-1 font-medium">
              Last updated: <span className="text-babyshopBlack/70">{formattedDate}</span>
            </p>
          )}
        </div>

        <div className="bg-white border border-babyShopLightWhite rounded-xl p-5 w-full md:w-72 shadow-sm shrink-0">
          <h4 className="text-xs font-bold uppercase tracking-wider text-babyshopBlack/40 mb-3">
            Quick Navigation Overview
          </h4>
          <div className="space-y-2.5">
            {["User compliance rules", "Payment & License terms", "Return & Liability policies"].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium text-babyshopBlack/70">
                <span className="w-1.5 h-1.5 rounded-full bg-babyshopSky shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABLE OF CONTENTS (MỤC LỤC CHI TIẾT) ── */}
      <div className="bg-babyshopLightBg/60 border border-babyShopLightWhite rounded-2xl p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-babyshopTextLight mb-4 px-1">
          Table of Contents
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tableOfContents.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-babyShopLightWhite/80 rounded-xl text-xs font-medium text-babyshopBlack/65 hover:text-babyshopSky hover:border-babyshopSky/20 hover:shadow-sm transition-all duration-200"
            >
              <span className="text-[10px] text-babyshopTextLight font-mono bg-babyshopLightBg w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="truncate">{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── SECTIONS DETAILS ── */}
      <div className="space-y-4">

        {/* 01. Acceptance of Terms */}
        <div id="acceptance">
          <TermSectionCard index={1} title={terms.acceptanceOfTerms.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          >
            <p>{terms.acceptanceOfTerms.content}</p>
          </TermSectionCard>
        </div>

        {/* 02. Use License */}
        <div id="license">
          <TermSectionCard index={2} title={terms.useLicense.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M19 20a2 2 0 01-2-2v-1m-1-4l3-3m0 0l-3-3m3 3H9" /></svg>}
          >
            <p className="mb-4">{terms.useLicense.content}</p>
            <div className="grid grid-cols-1 gap-2">
              {terms.useLicense.items.map((item, i) => (
                <ListItem key={i} text={item} />
              ))}
            </div>
          </TermSectionCard>
        </div>

        {/* 03. Product Information */}
        <div id="products">
          <TermSectionCard index={3} title={terms.productInformation.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          >
            <p>{terms.productInformation.content}</p>
          </TermSectionCard>
        </div>

        {/* 04. Pricing and Payment */}
        <div id="pricing">
          <TermSectionCard index={4} title={terms.pricingAndPayment.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
          >
            <p className="mb-4">{terms.pricingAndPayment.content}</p>
            <div className="grid grid-cols-1 gap-2">
              {terms.pricingAndPayment.items.map((item, i) => (
                <ListItem key={i} text={item} />
              ))}
            </div>
          </TermSectionCard>
        </div>

        {/* 05. Shipping and Delivery */}
        <div id="shipping">
          <TermSectionCard index={5} title={terms.shippingAndDelivery.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
          >
            <p>{terms.shippingAndDelivery.content}</p>
          </TermSectionCard>
        </div>

        {/* 06. Returns and Exchanges */}
        <div id="returns">
          <TermSectionCard index={6} title={terms.returnsAndExchanges.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17.5" /></svg>}
          >
            <p className="mb-4">{terms.returnsAndExchanges.content}</p>
            <div className="grid grid-cols-1 gap-2">
              {terms.returnsAndExchanges.items.map((item, i) => (
                <ListItem key={i} text={item} />
              ))}
            </div>
          </TermSectionCard>
        </div>

        {/* 07. Account Registration */}
        <div id="account">
          <TermSectionCard index={7} title={terms.accountRegistration.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          >
            <p>{terms.accountRegistration.content}</p>
          </TermSectionCard>
        </div>

        {/* 08. Limitation of Liability */}
        <div id="liability">
          <TermSectionCard index={8} title={terms.limitationOfLiability.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          >
            <div className="p-4 bg-babyshopRed/[0.03] border border-babyshopRed/10 rounded-xl text-sm text-babyshopBlack/70 leading-relaxed">
              {terms.limitationOfLiability.content}
            </div>
          </TermSectionCard>
        </div>

        {/* 09. Privacy Policy */}
        <div id="privacy">
          <TermSectionCard index={9} title={terms.privacyPolicy.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          >
            <p>{terms.privacyPolicy.content}</p>
          </TermSectionCard>
        </div>

        {/* 10. Governing Law */}
        <div id="law">
          <TermSectionCard index={10} title={terms.governingLaw.title}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
          >
            <p>{terms.governingLaw.content}</p>
          </TermSectionCard>
        </div>

      </div>

      {/* ── CONTACT INFORMATION ── */}
      <div className="border border-babyShopLightWhite rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-babyShopLightWhite bg-babyshopLightBg/50">
          <div className="w-9 h-9 rounded-xl border border-babyShopLightWhite bg-white flex items-center justify-center text-babyshopSky">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-babyshopBlack">
            {terms.contactInformation.title}
          </span>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          <p className="text-sm text-babyshopBlack/65 leading-relaxed">
            {terms.contactInformation.content}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Email Address", value: terms.contactInformation.email, color: "text-babyshopSky" },
              { label: "Hotline Phone", value: terms.contactInformation.phone, color: "text-babyshopBlack/80" },
              { label: "Head Office", value: terms.contactInformation.address, color: "text-babyshopBlack/80" },
            ].map((item, i) => (
              <div key={i} className="bg-babyshopLightBg/60 border border-babyShopLightWhite/40 rounded-xl p-4 flex flex-col justify-between gap-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-babyshopTextLight">
                  {item.label}
                </span>
                <span className={`text-sm font-medium break-words ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PageTerms;