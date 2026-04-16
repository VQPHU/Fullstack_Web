import express from "express";
import {
    getProductTypes,
    getProductTypeById,
    createProductType,
    updateProductType,
    deleteProductType,
} from "../controllers/productTypeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getProductTypes)
    .post(protect, admin, createProductType);

router.route("/:id")
    .get(getProductTypeById)
    .put(protect, admin, updateProductType)
    .delete(protect, admin, deleteProductType);

export default router;
