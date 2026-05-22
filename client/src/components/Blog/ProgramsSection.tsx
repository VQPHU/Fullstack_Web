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
  Play,
} from "lucide-react";
import {
  BlogPageData,
  ProgramSection,
  ApplyStep,
  Stat,
  Testimonial,
  MediaItem,
} from "@/app/blog/page";

interface Props {
  data: BlogPageData[];
}

const programIcons: Record<string, React.ReactNode> = {
  partnership: <Users className="w-5 h-5" />,
  associate: <Star className="w-5 h-5" />,
  wholesale_socks: <Package className="w-5 h-5" />,
  wholesale_funny_socks: <Zap className="w-5 h-5" />,
};

// ─── MEDIA RENDERER ────────────────────────────────────────────────────────

/**
 * Chuyển url youtube dạng watch?v= hoặc youtu.be thành dạng embed
 */
function toYoutubeEmbed(url: string): string {
  try {
    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // youtube.com/watch?v=<id>
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    // youtube.com/embed/<id> — đã đúng rồi
    if (u.pathname.startsWith("/embed")) return url;
  } catch {
    // fallback
  }
  return url;
}

/**
 * Render 1 media item (image | video | youtube).
 * className để tuỳ chỉnh kích thước từ nơi gọi.
 */
const MediaRenderer: React.FC<{
  item: MediaItem;
  className?: string;
  imgClassName?: string;
}> = ({ item, className = "", imgClassName = "" }) => {
  const [playing, setPlaying] = useState(false);

  if (item.type === "youtube") {
    const embedUrl = toYoutubeEmbed(item.url);
    return (
      <figure className={`relative overflow-hidden rounded-2xl bg-babyshopBlack ${className}`}>
        {!playing ? (
          <button
            onClick={() => setPlaying(true)}
            className="relative w-full h-full flex items-center justify-center group"
            aria-label={`Play ${item.alt || "video"}`}
          >
            {/* thumbnail từ youtube */}
            <img
              src={`https://img.youtube.com/vi/${new URL(embedUrl).pathname.replace("/embed/", "")}/hqdefault.jpg`}
              alt={item.alt || ""}
              className={`w-full h-full object-cover ${imgClassName}`}
            />
            {/* overlay */}
            <span className="absolute inset-0 bg-black/40 group-hover:bg-black/30 hoverEffect" />
            {/* play button */}
            <span className="absolute w-14 h-14 rounded-full bg-babyshopSky/90 flex items-center justify-center group-hover:scale-110 hoverEffect">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </span>
          </button>
        ) : (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={item.alt || "YouTube video"}
          />
        )}
        {item.caption && (
          <figcaption className="px-3 py-2 text-[10px] text-babyshopTextLight text-center">
            {item.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (item.type === "video") {
    return (
      <figure className={`overflow-hidden rounded-2xl bg-babyshopBlack ${className}`}>
        <video
          src={item.url}
          controls
          className={`w-full object-cover ${imgClassName}`}
          aria-label={item.alt || undefined}
        />
        {item.caption && (
          <figcaption className="px-3 py-2 text-[10px] text-babyshopTextLight text-center">
            {item.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // image (default)
  return (
    <figure className={`overflow-hidden rounded-2xl ${className}`}>
      <div className={`relative w-full ${imgClassName}`}>
        <Image
          src={item.url}
          alt={item.alt || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {item.caption && (
        <figcaption className="px-3 py-2 text-[10px] text-babyshopTextLight text-center">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
};

/**
 * Render danh sách media items. Tự chia layout theo số lượng.
 * position "hero" → full-width, còn lại → grid
 */
const MediaGrid: React.FC<{ items: MediaItem[]; heroHeight?: string }> = ({
  items,
  heroHeight = "h-56 md:h-72",
}) => {
  if (!items?.length) return null;

  const heroItems = items.filter((m) => m.position === "hero");
  const restItems = items.filter((m) => m.position !== "hero");

  return (
    <div className="space-y-3">
      {heroItems.map((item, i) => (
        <MediaRenderer
          key={i}
          item={item}
          className="w-full"
          imgClassName={heroHeight}
        />
      ))}
      {restItems.length > 0 && (
        <div
          className={`grid gap-3 ${restItems.length === 1
              ? "grid-cols-1"
              : restItems.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-3"
            }`}
        >
          {restItems.map((item, i) => (
            <MediaRenderer
              key={i}
              item={item}
              className="w-full"
              imgClassName="h-40 md:h-52"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const ProgramsSection: React.FC<Props> = ({ data }) => {
  const page = data?.[0];
  if (!page) return null;

  const visiblePrograms = page.programs
    ?.filter((p) => p.isVisible)
    .sort((a, b) => a.order - b.order) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-16 antialiased">

      {/* ── HERO ── */}
      <div className="relative rounded-3xl bg-babyshopBlack overflow-hidden">
        {/* Hero media (background / stacked) */}
        {page.hero.media?.length > 0 && (
          <div className="w-full">
            <MediaGrid items={page.hero.media} heroHeight="h-64 md:h-96" />
          </div>
        )}

        <div className="px-8 py-12 md:px-16 md:py-16 relative">
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

      {/* ── STATS + SUCCESS MEDIA ── */}
      {(page.programSuccess?.stats?.length > 0 ||
        page.programSuccess?.media?.length > 0) && (
          <div className="rounded-3xl border border-babyShopLightWhite bg-babyshopLightBg p-8 md:p-12 space-y-8">
            <SectionHeader
              label="Program Success"
              title={page.programSuccess.title}
              subtitle={page.programSuccess.subtitle}
            />

            {/* stats */}
            {page.programSuccess.stats?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {page.programSuccess.stats.map((stat, i) => (
                  <StatCard key={i} stat={stat} />
                ))}
              </div>
            )}

            {page.programSuccess.description && (
              <p className="text-babyshopTextLight text-sm leading-relaxed text-center max-w-2xl mx-auto">
                {page.programSuccess.description}
              </p>
            )}

            {/* media */}
            {page.programSuccess.media?.length > 0 && (
              <MediaGrid items={page.programSuccess.media} heroHeight="h-56 md:h-72" />
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

          {/* media trên steps */}
          {page.howToApply.media?.length > 0 && (
            <MediaGrid items={page.howToApply.media} heroHeight="h-52 md:h-64" />
          )}

          <div className="relative">
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
        <div className="rounded-3xl bg-babyshopSky overflow-hidden relative">
          {/* closing media (behind overlay) */}
          {page.closingCta.media?.length > 0 && (
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <MediaGrid items={page.closingCta.media} heroHeight="h-full" />
            </div>
          )}

          <div className="p-10 md:p-14 text-center relative z-10">
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
                  Or call us:{" "}
                  <span className="text-white font-semibold">{page.closingCta.phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const ProgramCard: React.FC<{ program: ProgramSection }> = ({ program }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-babyShopLightWhite bg-white overflow-hidden hover:border-babyshopSky/30 hover:shadow-md hoverEffect flex flex-col">
      {/* program media (hero position first, rest stacked) */}
      {program.media?.length > 0 && (
        <div className="w-full">
          <MediaGrid items={program.media} heroHeight="h-44 md:h-52" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-babyshopSky/10 text-babyshopSky flex items-center justify-center flex-shrink-0">
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

        {/* testimonials bên trong program card */}
        {program.testimonials?.length > 0 && (
          <div className="mt-auto pt-4 border-t border-babyShopLightWhite space-y-3">
            {program.testimonials.slice(0, 1).map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-babyshopSky/20 text-babyshopSky text-[10px] font-bold flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {t.avatar
                    ? <Image src={t.avatar} alt={t.author} width={28} height={28} className="object-cover" />
                    : t.author?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] text-babyshopBlack/70 italic">"{t.quote}"</p>
                  <p className="text-[9px] text-babyshopTextLight mt-0.5">{t.author}{t.role ? ` · ${t.role}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {program.ctaLabel && (
          <Link
            href={program.ctaUrl || "#"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-babyshopSky hover:gap-3 hoverEffect mt-4"
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
      <div className="w-8 h-8 rounded-full bg-babyshopSky/20 text-babyshopSky text-xs font-bold flex items-center justify-center uppercase overflow-hidden flex-shrink-0">
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