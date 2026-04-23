import express from "express";
import {
    getHomepage,
    getAllComponents,
    updateComponent,
} from "../controllers/componentController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/homepage", getHomepage);

// Admin routes
router.get("/", protect, admin, getAllComponents);
router.put("/:id", protect, admin, updateComponent);

export default router;