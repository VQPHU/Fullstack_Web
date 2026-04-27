import express from "express";
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
} from "../controllers/notificationControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getNotifications).delete(protect, clearNotifications);
router.route("/:id").delete(protect, deleteNotification);

export default router;
