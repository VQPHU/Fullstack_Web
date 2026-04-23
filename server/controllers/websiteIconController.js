import asyncHandler from "express-async-handler";
import WebsiteIcon from "../models/WebsiteIconModel.js";
import cloudinary from "../config/cloudinary.js";

// GET ALL WEBSITE ICONS (search + filter by category)
const getWebsiteIcons = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
              $or: [
                  { name: { $regex: req.query.keyword, $options: "i" } },
                  { key: { $regex: req.query.keyword, $options: "i" } },
              ],
          }
        : {};

    const categoryFilter = req.query.category
        ? { category: req.query.category }
        : {};

    const icons = await WebsiteIcon.find({
        ...keyword,
        ...categoryFilter,
    }).sort({ order: 1 });

    res.status(200).json({
        success: true,
        count: icons.length,
        icons,
    });
});

// GET WEBSITE ICON BY ID
const getWebsiteIconById = asyncHandler(async (req, res) => {
    const icon = await WebsiteIcon.findById(req.params.id);

    if (icon) {
        res.status(200).json({
            success: true,
            icon,
        });
    } else {
        res.status(404);
        throw new Error("Website icon not found");
    }
});

// CREATE WEBSITE ICON
const createWebsiteIcon = asyncHandler(async (req, res) => {
    const { name, key, category, imageUrl, order, isActive } = req.body;

    const exists = await WebsiteIcon.findOne({ key });

    if (exists) {
        res.status(400);
        throw new Error("Website icon with this key already exists");
    }

    let uploadedImageUrl = "";

    if (imageUrl) {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: "website-icons",
        });
        uploadedImageUrl = result.secure_url;
    }

    const icon = await WebsiteIcon.create({
        name,
        key,
        category,
        imageUrl: uploadedImageUrl,
        order,
        isActive,
    });

    res.status(201).json({
        success: true,
        icon,
    });
});

// UPDATE WEBSITE ICON
const updateWebsiteIcon = asyncHandler(async (req, res) => {
    const icon = await WebsiteIcon.findById(req.params.id);

    if (!icon) {
        res.status(404);
        throw new Error("Website icon not found");
    }

    icon.name = req.body.name || icon.name;
    icon.key = req.body.key || icon.key;
    icon.category = req.body.category || icon.category;
    icon.order = req.body.order ?? icon.order;
    icon.isActive = req.body.isActive ?? icon.isActive;

    if (req.body.imageUrl && req.body.imageUrl !== icon.imageUrl) {
        const result = await cloudinary.uploader.upload(req.body.imageUrl, {
            folder: "website-icons",
        });
        icon.imageUrl = result.secure_url;
    }

    const updated = await icon.save();

    res.status(200).json({
        success: true,
        icon: updated,
    });
});

// DELETE WEBSITE ICON
const deleteWebsiteIcon = asyncHandler(async (req, res) => {
    const icon = await WebsiteIcon.findById(req.params.id);

    if (!icon) {
        res.status(404);
        throw new Error("Website icon not found");
    }

    await icon.deleteOne();

    res.status(200).json({
        success: true,
        message: "Website icon deleted successfully",
    });
});

export {
    getWebsiteIcons,
    getWebsiteIconById,
    createWebsiteIcon,
    updateWebsiteIcon,
    deleteWebsiteIcon,
};