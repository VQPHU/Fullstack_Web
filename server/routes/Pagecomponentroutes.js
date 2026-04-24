import express from "express";
import {
    getPageComponents,
    getAllPageComponents,
    getPageComponentById,
    createPageComponent,
    updatePageComponent,
    deletePageComponent,
    reorderPageComponents,
    getComponentTypes,
} from "../controllers/pageComponentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── PUBLIC ────────────────────────────────────────────────────────────────────
// Lấy data thực tế cho frontend theo pageType (home, product, blog...)
router.get("/public/:pageType", getPageComponents);

// ─── ADMIN ─────────────────────────────────────────────────────────────────────
// Lấy danh sách component types từ COMPONENT_MAP (cho dropdown)
router.get("/component-types", protect, admin, getComponentTypes);

// Reorder (phải đặt trước /:id để không bị conflict)
router.patch("/reorder", protect, admin, reorderPageComponents);

// CRUD
router.get("/", protect, admin, getAllPageComponents);
router.post("/", protect, admin, createPageComponent);
router.get("/:id", protect, admin, getPageComponentById);
router.put("/:id", protect, admin, updatePageComponent);
router.delete("/:id", protect, admin, deletePageComponent);

export default router;