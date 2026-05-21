"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Star,
  Users,
  Zap,
  Package,
} from "lucide-react";
import {
  BlogPageData,
  ProgramSection,
  ApplyStep,
  Stat,
  Testimonial,
} from "@/app/blog/page";

interface Props {
  data: BlogPageData[];
}

const programIcons: Record<string, React.ReactNode> = {
  partnership:           <Users className="w-5 h-5" />,
  associate:             <Star className="w-5 h-5" />,
  wholesale_socks:       <Package className="w-5 h-5" />,
  wholesale_funny_socks: <Zap className="w-5 h-5" />,
};

const ProgramsSection: React.FC<Props> = ({ data }) => {
  const page = data?.[0];
  if (!page) return null;

  const visiblePrograms = page.programs
    ?.filter((p) => p.isVisible)
    .sort((a, b) => a.order - b.order) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-16 antialiased">

      {/* ── HERO ── */}
      <div className="relative rounded-3xl bg-babyshopBlack overflow-hidden px-8 py-16 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-babyshopSky/20 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-babyshopSky/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-babyshopSky text-[10px] font-bold tracking-[0.3em] uppercase mb-5">
            <span className="w-6 h-px bg-babyshopSky" />
            Business Programs
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-babyshopWhite leading-tight tracking-tight mb-5">
            {page.hero.heading}
          </h1>
          {page.hero.subheading && (
            <p className="text-babyshopWhite/60 text-lg mb-3">{page.hero.subheading}</p>
          )}
          {page.hero.description && (
            <p className="text-babyshopWhite/50 text-sm leading-relaxed mb-8">
              {page.hero.description}
            </p>
          )}
          {page.hero.ctaLabel && (
            <Link
              href={page.hero.ctaUrl || "#programs"}
              className="inline-flex items-center gap-2 bg-babyshopSky text-babyshopWhite px-6 py-3 rounded-full text-sm font-semibold hover:bg-babyshopSky/90 hoverEffect"
            >
              {page.hero.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* ── PROGRAMS ── */}
      {visiblePrograms.length > 0 && (
        <div id="programs" className="space-y-5">
          <SectionHeader label="Our Programs" title="Choose Your Path" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visiblePrograms.map((program) => (
              <ProgramCard key={program.key} program={program} />
            ))}
          </div>
        </div>
      )}

      {/* ── STATS ── */}
      {page.programSuccess?.stats?.length > 0 && (
        <div className="rounded-3xl border border-babyShopLightWhite bg-babyshopLightBg p-8 md:p-12">
          <SectionHeader
            label="Program Success"
            title={page.programSuccess.title}
            subtitle={page.programSuccess.subtitle}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {page.programSuccess.stats.map((stat, i) => (
              <StatCard key={i} stat={stat} />
            ))}
          </div>
          {page.programSuccess.description && (
            <p className="text-babyshopTextLight text-sm leading-relaxed mt-6 text-center max-w-2xl mx-auto">
              {page.programSuccess.description}
            </p>
          )}
        </div>
      )}

      {/* ── TESTIMONIALS ── */}
      {page.programSuccess?.testimonials?.length > 0 && (
        <div className="space-y-5">
          <SectionHeader label="What They Say" title="Partner Stories" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {page.programSuccess.testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
      )}

      {/* ── HOW TO APPLY ── */}
      {page.howToApply?.steps?.length > 0 && (
        <div className="space-y-5">
          <SectionHeader
            label="Get Started"
            title={page.howToApply.title}
            subtitle={page.howToApply.subtitle}
          />
          <div className="relative">
            {/* connector line */}
            <div className="absolute left-5 top-8 bottom-8 w-px bg-babyShopLightWhite hidden md:block" />
            <div className="space-y-4">
              {page.howToApply.steps.map((step) => (
                <StepCard key={step.step} step={step} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CLOSING CTA ── */}
      {page.closingCta?.heading && (
        <div className="rounded-3xl bg-babyshopSky p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-babyshopWhite mb-4">
              {page.closingCta.heading}
            </h2>
            {page.closingCta.description && (
              <p className="text-white/70 text-sm max-w-xl mx-auto mb-8">
                {page.closingCta.description}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {page.closingCta.primaryCtaLabel && (
                <Link
                  href={page.closingCta.primaryCtaUrl || "#"}
                  className="bg-babyshopWhite text-babyshopSky px-6 py-3 rounded-full text-sm font-bold hover:bg-white/90 hoverEffect"
                >
                  {page.closingCta.primaryCtaLabel}
                </Link>
              )}
              {page.closingCta.secondaryCtaLabel && (
                <Link
                  href={page.closingCta.secondaryCtaUrl || "#"}
                  className="border border-white/40 text-babyshopWhite px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/10 hoverEffect"
                >
                  {page.closingCta.secondaryCtaLabel}
                </Link>
              )}
            </div>
            {page.closingCta.phone && (
              <p className="text-white/50 text-xs mt-5">
                Or call us: <span className="text-white font-semibold">{page.closingCta.phone}</span>
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

/* ── SUB-COMPONENTS ── */

const ProgramCard: React.FC<{ program: ProgramSection }> = ({ program }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-babyShopLightWhite bg-white overflow-hidden hover:border-babyshopSky/30 hover:shadow-md hoverEffect">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-babyshopSky/10 text-babyshopSky flex items-center justify-center">
              {programIcons[program.key] ?? <Star className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-babyshopBlack">{program.title}</h3>
              {program.subtitle && (
                <p className="text-[10px] text-babyshopTextLight">{program.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-babyshopTextLight leading-relaxed mb-4">
          {program.description}
        </p>

        {program.benefits?.length > 0 && (
          <div className="space-y-2 mb-4">
            {(open ? program.benefits : program.benefits.slice(0, 3)).map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-babyshopSky mt-0.5 flex-shrink-0" />
                <span className="text-xs text-babyshopBlack/75">
                  {b.icon} {b.text}
                </span>
              </div>
            ))}
            {program.benefits.length > 3 && (
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-[10px] text-babyshopSky font-semibold mt-1"
              >
                {open ? "Show less" : `+${program.benefits.length - 3} more`}
                <ChevronDown className={`w-3 h-3 hoverEffect ${open ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )}

        {program.ctaLabel && (
          <Link
            href={program.ctaUrl || "#"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-babyshopSky hover:gap-3 hoverEffect"
          >
            {program.ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ stat: Stat }> = ({ stat }) => (
  <div className="text-center">
    <p className="text-3xl font-bold text-babyshopSky">{stat.value}</p>
    <p className="text-xs text-babyshopTextLight mt-1">{stat.label}</p>
  </div>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div className="bg-white border border-babyShopLightWhite rounded-2xl p-5 flex flex-col gap-4">
    <p className="text-xs text-babyshopBlack/75 leading-relaxed italic">
      "{testimonial.quote}"
    </p>
    <div className="flex items-center gap-3 mt-auto pt-3 border-t border-babyShopLightWhite">
      <div className="w-8 h-8 rounded-full bg-babyshopSky/20 text-babyshopSky text-xs font-bold flex items-center justify-center uppercase overflow-hidden">
        {testimonial.avatar
          ? <Image src={testimonial.avatar} alt={testimonial.author} width={32} height={32} className="object-cover" />
          : testimonial.author?.[0]}
      </div>
      <div>
        <p className="text-xs font-bold text-babyshopBlack">{testimonial.author}</p>
        <p className="text-[10px] text-babyshopTextLight">{testimonial.role}</p>
      </div>
      {testimonial.followers && (
        <span className="ml-auto text-[9px] bg-babyshopLightBg text-babyshopTextLight px-2 py-0.5 rounded-full">
          {testimonial.followers}
        </span>
      )}
    </div>
  </div>
);

const StepCard: React.FC<{ step: ApplyStep }> = ({ step }) => (
  <div className="flex items-start gap-5 bg-white border border-babyShopLightWhite rounded-2xl p-5 hover:border-babyshopSky/30 hoverEffect">
    <div className="w-10 h-10 rounded-full bg-babyshopSky text-babyshopWhite text-sm font-bold flex items-center justify-center flex-shrink-0">
      {step.step}
    </div>
    <div>
      <h4 className="text-sm font-bold text-babyshopBlack mb-1">
        {step.icon} {step.title}
      </h4>
      <p className="text-xs text-babyshopTextLight leading-relaxed">{step.description}</p>
    </div>
  </div>
);

const SectionHeader: React.FC<{ label: string; title: string; subtitle?: string }> = ({
  label, title, subtitle,
}) => (
  <div className="mb-2">
    <p className="text-[10px] tracking-[0.3em] uppercase text-babyshopSky font-semibold mb-2">{label}</p>
    <h2 className="text-2xl font-bold text-babyshopBlack tracking-tight">{title}</h2>
    {subtitle && <p className="text-babyshopTextLight text-sm mt-1">{subtitle}</p>}
  </div>
);

export default ProgramsSection;