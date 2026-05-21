// blogmodel.js

import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─── MEDIA SCHEMA (reusable for images & videos) ───────────────────────────
const MediaSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["image", "video", "youtube"],
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        alt: {
            type: String, // accessibility / SEO alt text
            default: "",
        },
        caption: {
            type: String,
            default: "",
        },
        position: {
            type: String, // e.g. "hero", "section-1", "closing"
            default: "",
        },
    },
    { _id: false }
);

// ─── TESTIMONIAL SCHEMA ────────────────────────────────────────────────────
const TestimonialSchema = new Schema(
    {
        quote: { type: String, required: true },
        author: { type: String, required: true },
        role: { type: String, default: "" },       // e.g. "Store Owner, Texas"
        avatar: { type: String, default: "" },     // image URL
        platform: { type: String, default: "" },   // e.g. "Instagram", "YouTube"
        followers: { type: String, default: "" },  // e.g. "52K"
    },
    { _id: false }
);

// ─── BENEFIT SCHEMA ────────────────────────────────────────────────────────
const BenefitSchema = new Schema(
    {
        icon: { type: String, default: "" },   // emoji or icon name
        text: { type: String, required: true },
    },
    { _id: false }
);

// ─── PROGRAM SECTION SCHEMA ────────────────────────────────────────────────
const ProgramSectionSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
            enum: [
                "partnership",
                "associate",
                "wholesale_socks",
                "wholesale_funny_socks",
            ],
        },
        title: { type: String, required: true },
        subtitle: { type: String, default: "" },
        description: { type: String, required: true },
        benefits: [BenefitSchema],
        media: [MediaSchema],
        testimonials: [TestimonialSchema],
        ctaLabel: { type: String, default: "" },  // e.g. "Apply Now"
        ctaUrl: { type: String, default: "" },
        order: { type: Number, default: 0 },      // display order on page
        isVisible: { type: Boolean, default: true },
    },
    { _id: false }
);

// ─── STAT SCHEMA ───────────────────────────────────────────────────────────
const StatSchema = new Schema(
    {
        value: { type: String, required: true },  // e.g. "1,200+"
        label: { type: String, required: true },  // e.g. "Active Partners"
    },
    { _id: false }
);

// ─── HOW TO APPLY STEP SCHEMA ──────────────────────────────────────────────
const ApplyStepSchema = new Schema(
    {
        step: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: "" },
    },
    { _id: false }
);

// ─── SEO SCHEMA ────────────────────────────────────────────────────────────
const SeoSchema = new Schema(
    {
        metaTitle: { type: String, default: "" },
        metaDescription: { type: String, default: "" },
        ogImage: { type: String, default: "" },
        keywords: [{ type: String }],
        canonicalUrl: { type: String, default: "" },
    },
    { _id: false }
);

// ─── MAIN BLOG PAGE SCHEMA ─────────────────────────────────────────────────
const BlogPageSchema = new Schema(
    {
        // ── Identity
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            // e.g. "business-programs"
        },
        pageType: {
            type: String,
            enum: ["business_programs", "general", "landing"],
            default: "business_programs",
        },

        // ── Hero Section
        hero: {
            heading: { type: String, required: true },
            subheading: { type: String, default: "" },
            description: { type: String, default: "" },
            media: [MediaSchema],
            ctaLabel: { type: String, default: "Apply Now" },
            ctaUrl: { type: String, default: "" },
        },

        // ── Program Sections
        programs: [ProgramSectionSchema],

        // ── Program Success Section
        programSuccess: {
            title: { type: String, default: "Program Success" },
            subtitle: { type: String, default: "" },
            description: { type: String, default: "" },
            stats: [StatSchema],
            testimonials: [TestimonialSchema],
            media: [MediaSchema],
        },

        // ── How to Apply Section
        howToApply: {
            title: { type: String, default: "How to Apply" },
            subtitle: { type: String, default: "" },
            steps: [ApplyStepSchema],
            media: [MediaSchema],
        },

        // ── Ready to Partner CTA Section
        closingCta: {
            heading: { type: String, default: "Ready to Partner with Us?" },
            description: { type: String, default: "" },
            primaryCtaLabel: { type: String, default: "Apply Now" },
            primaryCtaUrl: { type: String, default: "" },
            secondaryCtaLabel: { type: String, default: "Talk to Our Team" },
            secondaryCtaUrl: { type: String, default: "" },
            phone: { type: String, default: "" },
            media: [MediaSchema],
        },

        // ── SEO
        seo: SeoSchema,

        // ── Publishing
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        publishedAt: { type: Date, default: null },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        lastEditedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // ── Locale / i18n
        locale: {
            type: String,
            default: "en",
            enum: ["en", "vi", "ar", "fr"],
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
        versionKey: "__v",
    }
);

// ─── INDEXES ───────────────────────────────────────────────────────────────
BlogPageSchema.index({ slug: 1, locale: 1 }, { unique: true });
BlogPageSchema.index({ status: 1, publishedAt: -1 });
BlogPageSchema.index({ pageType: 1 });

// ─── EXPORT ────────────────────────────────────────────────────────────────
const BlogPage = model("BlogPage", BlogPageSchema);

export default BlogPage;