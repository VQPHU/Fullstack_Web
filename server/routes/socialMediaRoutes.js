import express from "express";
import {
    getSocialMediaLinks,
    getSocialMediaById,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
} from "../controllers/socialMediaController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getSocialMediaLinks)
    .post(protect, admin, createSocialMedia);

router.route("/:id")
    .get(getSocialMediaById)
    .put(protect, admin, updateSocialMedia)
    .delete(protect, admin, deleteSocialMedia);

export default router;