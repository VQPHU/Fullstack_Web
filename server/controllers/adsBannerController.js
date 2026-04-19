// controllers/adsBannerController.js
import asyncHandler from "express-async-handler";
import AdsBanner from "../models/adsBannerModel.js";
import cloudinary from "../config/cloudinary.js";

// @desc Get all ads banners
// @route GET /api/ads-banners
// @access Private
const getAdsBanners = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const banners = await AdsBanner.find(filter)
        .populate("title", "name type color status")
        .sort({ order: 1 });

    res.json(banners);
});

// @desc Get ads banner by ID
// @route GET /api/ads-banners/:id
// @access Private
const getAdsBannerById = asyncHandler(async (req, res) => {
    const banner = await AdsBanner.findById(req.params.id)
        .populate("title", "name type color status");

    if (banner) {
        res.json(banner);
    } else {
        res.status(404);
        throw new Error("Ads banner not found");
    }
});

// @desc Create an ads banner
// @route POST /api/ads-banners
// @access Private/Admin
const createAdsBanner = asyncHandler(async (req, res) => {
    const { name, title, image, type, order, status } = req.body;

    let imageUrl = "";
    if (image) {
        const result = await cloudinary.uploader.upload(image, {
            folder: "babymartyt/ads-banners",  // 👈 đổi folder cho đúng project
        });
        imageUrl = result.secure_url;
    }

    const banner = await AdsBanner.create({
        name,
        title,
        image: imageUrl || undefined,
        type,
        order,
        status,
    });

    if (banner) {
        res.status(201).json(banner);
    } else {
        res.status(400);
        throw new Error("Invalid ads banner data");
    }
});

// @desc Update an ads banner
// @route PUT /api/ads-banners/:id
// @access Private/Admin
const updateAdsBanner = asyncHandler(async (req, res) => {
    const { name, title, image, type, order, status } = req.body;

    const banner = await AdsBanner.findById(req.params.id);

    if (banner) {
        banner.name = name ?? banner.name;
        banner.title = title ?? banner.title;
        banner.type = type ?? banner.type;
        banner.order = order ?? banner.order;
        banner.status = status ?? banner.status;

        if (image !== undefined) {
            if (image) {
                const result = await cloudinary.uploader.upload(image, {
                    folder: "babymartyt/ads-banners",
                });
                banner.image = result.secure_url;
            } else {
                banner.image = undefined; // clear image nếu truyền chuỗi rỗng
            }
        }

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } else {
        res.status(404);
        throw new Error("Ads banner not found");
    }
});

// @desc Delete an ads banner
// @route DELETE /api/ads-banners/:id
// @access Private/Admin
const deleteAdsBanner = asyncHandler(async (req, res) => {
    const banner = await AdsBanner.findById(req.params.id);

    if (banner) {
        await banner.deleteOne();
        res.json({ message: "Ads banner removed" });
    } else {
        res.status(404);
        throw new Error("Ads banner not found");
    }
});

export {
    getAdsBanners,
    getAdsBannerById,
    createAdsBanner,
    updateAdsBanner,
    deleteAdsBanner,
};