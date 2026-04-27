import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["announcement", "offer", "deal", "promotion", "alert", "admin_message", "general"],
            default: "announcement",
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "urgent"],
            default: "normal",
        },
        image: {
            type: String,
            default: null,
        },
        actionButtonText: {
            type: String,
            default: null,
        },
        actionButtonUrl: {
            type: String,
            default: null,
        },
        // All Users or Specific Users
        targetAudience: {
            type: String,
            enum: ["all", "specific"],
            default: "all",
        },
        // List of recipients (users who received the notification)
        recipients: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                isRead: {
                    type: Boolean,
                    default: false,
                },
                readAt: {
                    type: Date,
                    default: null,
                },
            },
        ],
        // Sent by admin
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual: total sent
notificationSchema.virtual("totalSent").get(function () {
    return this.recipients.length;
});

// Virtual: total read
notificationSchema.virtual("totalRead").get(function () {
    return this.recipients.filter((r) => r.isRead).length;
});

const NotificationAdmin = mongoose.model("NotificationAdmin", notificationSchema);
export default NotificationAdmin;