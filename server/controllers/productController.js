import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import ProductType from "../models/productTypeModel.js";
import cloudinary from "../config/cloudinary.js";

const resolveReferencedId = async (Model, value) => {
  if (!value) return null;

  // Nếu là ID chuẩn thì trả về luôn
  if (mongoose.Types.ObjectId.isValid(value)) return value;

  // Tìm trực tiếp theo slug (không cần regex phức tạp)
  const document = await Model.findOne({ slug: value }).select("_id");
  
  return document?._id;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit,
    perPage,
    sortOrder = "asc",
    category,
    productType,
    brand,
    priceMin,
    priceMax,
    search,
    includeInactiveTypes = "false",
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit || perPage || 10);

  if (pageNumber < 1 || limitNumber < 1) {
    res.status(400);
    throw new Error("Page and limit must be positive integers");
  }

  if (!["asc", "desc"].includes(sortOrder)) {
    res.status(400);
    throw new Error('Sort order must be "asc" or "desc"');
  }

  const query = {};
  const includeInactiveProductTypes = includeInactiveTypes === "true";

  if (category) {
    const categoryId = await resolveReferencedId(Category, category);
    if (!categoryId) {
      return res.json({ products: [], total: 0 });
    }
    query.category = categoryId;
  }

  if (brand) {
    const brandId = await resolveReferencedId(Brand, brand);
    if (!brandId) {
      return res.json({ products: [], total: 0 });
    }
    query.brand = brandId;
  }

  if (productType) {
    const productTypeId = await resolveReferencedId(ProductType, productType);
    if (!productTypeId) {
      return res.json({ products: [], total: 0 });
    }
    query.productType = productTypeId;
  }

  if (!includeInactiveProductTypes) {
    const activeProductTypes = await ProductType.find({ status: "Active" }).select("_id");
    const activeProductTypeIds = activeProductTypes.map((item) => item._id);

    if (query.productType) {
      const isActiveProductType = activeProductTypeIds.some(
        (id) => id.toString() === query.productType.toString()
      );

      if (!isActiveProductType) {
        return res.json({ products: [], total: 0, page: pageNumber, totalPages: 0 });
      }
    } else {
      query.$or = [
        { productType: { $in: activeProductTypeIds } },
        { productType: { $exists: false } },
        { productType: null },
      ];
    }
  }

  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) {
      query.price.$lte =
        Number(priceMax) === Infinity
          ? Number.MAX_SAFE_INTEGER
          : Number(priceMax);
    }
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const skip = (pageNumber - 1) * limitNumber;
  const sortValue = sortOrder === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .populate("productType", "name type color status")
      .populate("brand", "name")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: sortValue }),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  res.json({ products, total, page: pageNumber, totalPages });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("productType", "name type color status")
    .populate("brand", "name");

  if (product) {
    if (product.productType?.status === "Inactive") {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    productType,
    brand,
    image,
    discountPercentage,
    stock,
  } = req.body;

  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product with this name already exists");
  }

  const result = await cloudinary.uploader.upload(image, {
    folder: "admin-dashboard/products",
  });

  const product = await Product.create({
    name,
    description,
    price,
    category,
    productType,
    brand,
    discountPercentage: discountPercentage || 0,
    stock: stock || 0,
    image: result.secure_url,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    productType,
    brand,
    image,
    discountPercentage,
    stock,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    if (name !== product.name) {
      const productExists = await Product.findOne({ name });
      if (productExists) {
        res.status(400);
        throw new Error("Product with this name already exists");
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.productType = productType || product.productType;
    product.brand = brand || product.brand;
    product.discountPercentage =
      discountPercentage || product.discountPercentage;
    product.stock = stock || product.stock;

    if (image && image !== product.image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "admin-dashboard/products",
      });
      product.image = result.secure_url;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Rate product
// @route   POST /api/products/:id/rate
// @access  Private
const rateProduct = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyRated = product.ratings.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyRated) {
      alreadyRated.rating = rating;
    } else {
      product.ratings.push({
        userId: req.user._id,
        rating,
      });
    }

    await product.save();
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  rateProduct,
  deleteProduct,
};
