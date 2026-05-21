import ProgramsSection from "@/components/Blog/ProgramsSection";
import Container from "@/components/common/container";

import { fetchData } from "@/lib/api";

export const dynamic = "force-dynamic";

export interface MediaItem {
  type: "image" | "video" | "youtube";
  url: string;
  alt: string;
  caption: string;
  position: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  platform: string;
  followers: string;
}

export interface Benefit {
  icon: string;
  text: string;
}

export interface ProgramSection {
  key: "partnership" | "associate" | "wholesale_socks" | "wholesale_funny_socks";
  title: string;
  subtitle: string;
  description: string;
  benefits: Benefit[];
  media: MediaItem[];
  testimonials: Testimonial[];
  ctaLabel: string;
  ctaUrl: string;
  order: number;
  isVisible: boolean;
}

export interface ApplyStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface BlogPageData {
  _id: string;
  slug: string;
  pageType: string;
  locale: string;
  status: string;
  hero: {
    heading: string;
    subheading: string;
    description: string;
    media: MediaItem[];
    ctaLabel: string;
    ctaUrl: string;
  };
  programs: ProgramSection[];
  programSuccess: {
    title: string;
    subtitle: string;
    description: string;
    stats: Stat[];
    testimonials: Testimonial[];
    media: MediaItem[];
  };
  howToApply: {
    title: string;
    subtitle: string;
    steps: ApplyStep[];
    media: MediaItem[];
  };
  closingCta: {
    heading: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaUrl: string;
    secondaryCtaLabel: string;
    secondaryCtaUrl: string;
    phone: string;
    media: MediaItem[];
  };
}

interface BlogComponent {
  componentType: string;
  title: string;
  data: BlogPageData[];
}

const BlogPage = async () => {
  const result = await fetchData<{ components: BlogComponent[] }>(
    "/page-components/public/blog",
     { next: { revalidate: 0 } }
  );

  const components = result?.components || [];
  const blogComp = components.find((c) => c.componentType === "blog");

  return (
    <Container className="min-h-screen py-7">
      {blogComp && <ProgramsSection data={blogComp.data} />}
    </Container>
  );
};

export default BlogPage;