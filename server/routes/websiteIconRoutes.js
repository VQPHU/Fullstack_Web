import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
    getWebsiteIcons,
    getWebsiteIconById,
    createWebsiteIcon,
    updateWebsiteIcon,
    deleteWebsiteIcon,
} from "../controllers/websiteIconController.js";

const router = express.Router();

router.get("/", getWebsiteIcons);
router.get("/:id", protect, admin, getWebsiteIconById);

router.post("/", protect, admin, createWebsiteIcon);
router.put("/:id", protect, admin, updateWebsiteIcon);
router.delete("/:id", protect, admin, deleteWebsiteIcon);

export default router;