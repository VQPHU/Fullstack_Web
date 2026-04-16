import asyncHandler from "express-async-handler";
import ProductType from "../models/productTypeModel.js";

// @desc    Get all product types
// @route   GET /api/product-types
// @access  Private
const getProductTypes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const sortOrder = req.query.sortOrder || "asc";
    const search = req.query.search || "";
    const status = req.query.status;

    if (page < 1 || perPage < 1) {
        res.status(400);
        throw new Error("Page and perPage must be positive integers");
    }

    if (!["asc", "desc"].includes(sortOrder)) {
        res.status(400);
        throw new Error('Sort order must be "asc" or "desc"');
    }

    const query = {};

    if (status && ["Active", "Inactive"].includes(status)) {
        query.status = status;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * perPage;
    const total = await ProductType.countDocuments(query);
    const sortValue = sortOrder === "asc" ? 1 : -1;

    const productTypes = await ProductType.find(query)
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: sortValue });

    const totalPages = Math.ceil(total / perPage);
    const activeCount = await ProductType.countDocuments({ status: "Active" });

    res.json({ productTypes, total, activeCount, page, perPage, totalPages });
});

// @desc    Get product type by ID
// @route   GET /api/product-types/:id
// @access  Private
const getProductTypeById = asyncHandler(async (req, res) => {
    const productType = await ProductType.findById(req.params.id);

    if (productType) {
        res.json(productType);
    } else {
        res.status(404);
        throw new Error("Product type not found");
    }
});

// @desc    Create a product type
// @route   POST /api/product-types
// @access  Private/Admin
const createProductType = asyncHandler(async (req, res) => {
    const { name, type, description, status, color } = req.body;

    if (!name || typeof name !== "string") {
        res.status(400);
        throw new Error("Product type name is required and must be a string");
    }

    if (!type || typeof type !== "string") {
        res.status(400);
        throw new Error("Type is required and must be a string");
    }

    const nameExists = await ProductType.findOne({ name });
    if (nameExists) {
        res.status(400);
        throw new Error("Product type name already exists");
    }

    const typeExists = await ProductType.findOne({ type });
    if (typeExists) {
        res.status(400);
        throw new Error("Product type key already exists");
    }

    const productType = await ProductType.create({
        name,
        type,
        description,
        status: status || "Active",
        color,
    });

    if (productType) {
        res.status(201).json(productType);
    } else {
        res.status(400);
        throw new Error("Invalid product type data");
    }
});

// @desc    Update a product type
// @route   PUT /api/product-types/:id
// @access  Private/Admin
const updateProductType = asyncHandler(async (req, res) => {
    const { name, type, description, status, color } = req.body;

    if (status && !["Active", "Inactive"].includes(status)) {
        res.status(400);
        throw new Error('Status must be "Active" or "Inactive"');
    }

    const productType = await ProductType.findById(req.params.id);

    if (!productType) {
        res.status(404);
        throw new Error("Product type not found");
    }

    // Check duplicate name (exclude current)
    if (name && name !== productType.name) {
        const nameExists = await ProductType.findOne({ name });
        if (nameExists) {
            res.status(400);
            throw new Error("Product type name already exists");
        }
    }

    // Check duplicate type key (exclude current)
    if (type && type !== productType.type) {
        const typeExists = await ProductType.findOne({ type });
        if (typeExists) {
            res.status(400);
            throw new Error("Product type key already exists");
        }
    }

    productType.name = name || productType.name;
    productType.type = type || productType.type;
    productType.description = description !== undefined ? description : productType.description;
    productType.status = status || productType.status;
    productType.color = color !== undefined ? color : productType.color;

    const updatedProductType = await productType.save();
    res.json(updatedProductType);
});

// @desc    Delete a product type
// @route   DELETE /api/product-types/:id
// @access  Private/Admin
const deleteProductType = asyncHandler(async (req, res) => {
    const productType = await ProductType.findById(req.params.id);

    if (productType) {
        await productType.deleteOne();
        res.json({ message: "Product type removed" });
    } else {
        res.status(404);
        throw new Error("Product type not found");
    }
});

export {
    getProductTypes,
    getProductTypeById,
    createProductType,
    updateProductType,
    deleteProductType,
};
