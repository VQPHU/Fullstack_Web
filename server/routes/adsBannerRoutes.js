// routes/adsBannerRoutes.js
import express from "express";
import {
    getAdsBanners,
    getAdsBannerById,
    createAdsBanner,
    updateAdsBanner,
    deleteAdsBanner,
} from "../controllers/adsBannerController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getAdsBanners)
    .post(protect, admin, createAdsBanner);

router.route("/:id")
    .get(getAdsBannerById)
    .put(protect, admin, updateAdsBanner)
    .delete(protect, admin, deleteAdsBanner);

export default router;