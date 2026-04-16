import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    notifications,
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: "Notification deleted successfully",
  });
});

export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });

  res.json({
    success: true,
    message: "All notifications cleared successfully",
  });
});
