import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getNotificationStats,
  getNotificationHistory,
  getUsersForNotification,
  sendNotification,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// GET /api/notifications/stats
router.route("/stats").get(protect, admin, getNotificationStats);

// GET /api/notifications/history
router.route("/history").get(protect, admin, getNotificationHistory);

// GET /api/notifications/users?page=1&limit=10&search=
router.route("/users").get(protect, admin, getUsersForNotification);

// POST /api/notifications/send
router.route("/send").post(protect, admin, sendNotification);

// PATCH /api/notifications/:notificationId/read/:userId
router.route("/:notificationId/read/:userId").patch(protect, markAsRead);

export default router;