import asyncHandler from "express-async-handler";
import SocialMedia from "../models/socialMediaSchema.js";

// @desc    Get all social media links
// @route   GET /api/social-media
// @access  Private
const getSocialMediaLinks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const sortOrder = req.query.sortOrder || "desc";
    const search = req.query.search || "";
    const platform = req.query.platform;
    const isActive = req.query.isActive;

    if (page < 1 || perPage < 1) {
        res.status(400);
        throw new Error("Page and perPage must be positive integers");
    }

    if (!["asc", "desc"].includes(sortOrder)) {
        res.status(400);
        throw new Error('Sort order must be "asc" or "desc"');
    }

    const query = {};

    // Filter by platform
    if (platform && platform !== "All Platforms") {
        query.platform = platform;
    }

    // Filter by isActive
    if (isActive !== undefined && isActive !== "") {
        query.isActive = isActive === "true";
    }

    // Search by name or url
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { url: { $regex: search, $options: "i" } },
            { platform: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * perPage;
    const total = await SocialMedia.countDocuments(query);
    const sortValue = sortOrder === "asc" ? 1 : -1;

    const socialMediaLinks = await SocialMedia.find(query)
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: sortValue });

    const totalPages = Math.ceil(total / perPage);

    // Stats
    const activeCount = await SocialMedia.countDocuments({ isActive: true });
    const platformCount = await SocialMedia.distinct("platform").then(
        (platforms) => platforms.length
    );

    res.json({
        socialMediaLinks,
        total,
        activeCount,
        platformCount,
        page,
        perPage,
        totalPages,
    });
});

// @desc    Get social media link by ID
// @route   GET /api/social-media/:id
// @access  Private
const getSocialMediaById = asyncHandler(async (req, res) => {
    const socialMedia = await SocialMedia.findById(req.params.id);

    if (socialMedia) {
        res.json(socialMedia);
    } else {
        res.status(404);
        throw new Error("Social media link not found");
    }
});

// @desc    Create a social media link
// @route   POST /api/social-media
// @access  Private/Admin
const createSocialMedia = asyncHandler(async (req, res) => {
    const { name, platform, url, icon, order, isActive } = req.body;

    if (!name || typeof name !== "string") {
        res.status(400);
        throw new Error("Name is required and must be a string");
    }

    if (!platform || typeof platform !== "string") {
        res.status(400);
        throw new Error("Platform is required and must be a string");
    }

    if (!url || typeof url !== "string") {
        res.status(400);
        throw new Error("URL is required and must be a string");
    }

    const socialMedia = await SocialMedia.create({
        name,
        platform,
        url,
        icon: icon || "",
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
    });

    if (socialMedia) {
        res.status(201).json(socialMedia);
    } else {
        res.status(400);
        throw new Error("Invalid social media data");
    }
});

// @desc    Update a social media link
// @route   PUT /api/social-media/:id
// @access  Private/Admin
const updateSocialMedia = asyncHandler(async (req, res) => {
    const { name, platform, url, icon, order, isActive } = req.body;

    const socialMedia = await SocialMedia.findById(req.params.id);

    if (!socialMedia) {
        res.status(404);
        throw new Error("Social media link not found");
    }

    const validPlatforms = [
        "Facebook", "Instagram", "Twitter", "LinkedIn",
        "YouTube", "TikTok", "Pinterest", "WhatsApp",
        "Telegram", "Other",
    ];

    if (platform && !validPlatforms.includes(platform)) {
        res.status(400);
        throw new Error("Invalid platform value");
    }

    socialMedia.name = name || socialMedia.name;
    socialMedia.platform = platform || socialMedia.platform;
    socialMedia.url = url || socialMedia.url;
    socialMedia.icon = icon !== undefined ? icon : socialMedia.icon;
    socialMedia.order = order !== undefined ? order : socialMedia.order;
    socialMedia.isActive = isActive !== undefined ? isActive : socialMedia.isActive;

    const updatedSocialMedia = await socialMedia.save();
    res.json(updatedSocialMedia);
});

// @desc    Delete a social media link
// @route   DELETE /api/social-media/:id
// @access  Private/Admin
const deleteSocialMedia = asyncHandler(async (req, res) => {
    const socialMedia = await SocialMedia.findById(req.params.id);

    if (socialMedia) {
        await socialMedia.deleteOne();
        res.json({ message: "Social media link removed" });
    } else {
        res.status(404);
        throw new Error("Social media link not found");
    }
});

export {
    getSocialMediaLinks,
    getSocialMediaById,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
};