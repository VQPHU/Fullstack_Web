import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getNotificationStats,
  getNotificationHistory,
  getUsersForNotification,
  sendNotification,
  markAsRead,
  getMyNotifications,
} from "../controllers/NotificationAdmincontroller.js";

const router = express.Router();

// GET /api/notification-admin/stats
router.route("/stats").get(protect, admin, getNotificationStats);

// GET /api/notification-admin/history
router.route("/history").get(protect, admin, getNotificationHistory);

// GET /api/notification-admin/users?page=1&limit=10&search=
router.route("/users").get(protect, admin, getUsersForNotification);

// POST /api/notification-admin/send
router.route("/send").post(protect, admin, sendNotification);

// PUT /api/notification-admin/read/:notificationId/:userId
router.route("/read/:notificationId/:userId").put(protect, markAsRead);

// GET /api/notification-admin/my — lấy thông báo của user hiện tại
router.route("/my").get(protect, getMyNotifications);

export default router;