import asyncHandler from "express-async-handler";
import NotificationAdmin from "../models/NotificationAdminModel.js";
import User from "../models/userModels.js";
import cloudinary from "../config/cloudinary.js";


// =====================
// GET /api/notifications/stats
// Private/Admin
// =====================
const getNotificationStats = asyncHandler(async (req, res) => {
    const allNotifications = await NotificationAdmin.find({});

    const totalSent = allNotifications.reduce(
        (sum, n) => sum + (n.recipients?.length || 0),
        0
    );

    const totalRead = allNotifications.reduce(
        (sum, n) => sum + (n.recipients?.filter((r) => r.isRead).length || 0),
        0
    );

    const readRate = totalSent > 0
        ? ((totalRead / totalSent) * 100).toFixed(2)
        : 0;

    const bulkSends = allNotifications.filter(
        (n) => n.targetAudience === "all"
    ).length;

    const totalUsers = await User.countDocuments({ role: "user" });

    res.status(200).json({
        success: true,
        stats: {
            totalSent,
            totalRead,
            readRate: parseFloat(readRate),
            bulkSends,
            totalUsers,
        },
    });
});

// =====================
// GET /api/notifications/history
// Private/Admin
// =====================
const getNotificationHistory = asyncHandler(async (req, res) => {
    const notifications = await NotificationAdmin.find({})
        .populate("sentBy", "name email avatar")
        .sort({ createdAt: -1 });

    const history = notifications.map((n) => ({
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        image: n.image,
        actionButtonText: n.actionButtonText,
        actionButtonUrl: n.actionButtonUrl,
        targetAudience: n.targetAudience,
        totalSent: n.recipients?.length || 0,
        totalRead: n.recipients?.filter((r) => r.isRead).length || 0,
        sentBy: n.sentBy,
        createdAt: n.createdAt,
    }));

    res.status(200).json({
        success: true,
        notifications: history,
    });
});

// =====================
// GET /api/notifications/users
// Private/Admin — danh sách users để chọn khi Specific Users
// =====================
const getUsersForNotification = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
        role: "user",
        ...(search && {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
        }),
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select("_id name email avatar")
        .skip((page - 1) * limit)
        .limit(Number(limit));

    res.status(200).json({
        success: true,
        users,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
    });
});

// =====================
// POST /api/notifications/send
// Private/Admin
// =====================
const sendNotification = asyncHandler(async (req, res) => {
    const {
        title,
        message,
        type,
        priority,
        imageUrl,       // URL mode
        imageBase64,    // Upload mode (base64)
        actionButtonText,
        actionButtonUrl,
        targetAudience,
        userIds,        // Array of userIds khi targetAudience = "specific"
    } = req.body;

    if (!title || !message) {
        res.status(400);
        throw new Error("Title and message are required");
    }

    // Xử lý image
    let imageResult = null;
    if (imageBase64) {
        // Upload mode
        const uploaded = await cloudinary.uploader.upload(imageBase64, {
            folder: "babymartyt/notifications",
        });
        imageResult = uploaded.secure_url;
    } else if (imageUrl) {
        // URL mode
        imageResult = imageUrl;
    }

    // Xác định recipients
    let recipients = [];
    if (targetAudience === "specific") {
        if (!userIds || userIds.length === 0) {
            res.status(400);
            throw new Error("Please select at least one user");
        }
        recipients = userIds.map((id) => ({ userId: id, isRead: false }));
    } else {
        // All users
        const allUsers = await User.find({ role: "user" }).select("_id");
        recipients = allUsers.map((u) => ({ userId: u._id, isRead: false }));
    }

    const notification = await NotificationAdmin.create({
        title,
        message,
        type: type || "announcement",
        priority: priority || "normal",
        image: imageResult,
        actionButtonText: actionButtonText || null,
        actionButtonUrl: actionButtonUrl || null,
        targetAudience: targetAudience || "all",
        recipients,
        sentBy: req.user._id,
    });

    res.status(201).json({
        success: true,
        message: "Notification sent successfully",
        notification: {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            priority: notification.priority,
            image: notification.image,
            targetAudience: notification.targetAudience,
            totalSent: notification.recipients.length,
            createdAt: notification.createdAt,
        },
    });
});

// =====================
// PATCH /api/notifications/:notificationId/read/:userId
// Private — đánh dấu đã đọc (dùng cho user app)
// =====================
const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId, userId } = req.params;

    const notification = await NotificationAdmin.findById(notificationId);
    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    const recipient = notification.recipients?.find(
        (r) => r.userId.toString() === userId
    );

    if (!recipient) {
        res.status(404);
        throw new Error("User is not a recipient of this notification");
    }

    if (!recipient.isRead) {
        recipient.isRead = true;
        recipient.readAt = new Date();
        await notification.save();
    }

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
    });
});

// GET /api/notification-admin/my
// Private/User
const getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications = await NotificationAdmin.find({
        "recipients.userId": userId,
    }).sort({ createdAt: -1 });

    const result = notifications.map((n) => {
        const recipient = n.recipients.find(
            (r) => r.userId.toString() === userId.toString()
        );
        return {
            _id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            priority: n.priority,
            image: n.image,
            actionButtonText: n.actionButtonText,
            actionButtonUrl: n.actionButtonUrl,
            createdAt: n.createdAt,
            isRead: recipient?.isRead || false,
        };
    });

    res.status(200).json({ success: true, notifications: result });
});

export {
    getNotificationStats,
    getNotificationHistory,
    getUsersForNotification,
    sendNotification,
    markAsRead,
    getMyNotifications,
};