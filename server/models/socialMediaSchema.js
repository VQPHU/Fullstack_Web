import mongoose from "mongoose";

const socialMediaSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            required: true,
            enum: [
                "Facebook",
                "Instagram",
                "Twitter",
                "LinkedIn",
                "YouTube",
                "TikTok",
                "Pinterest",
                "WhatsApp",
                "Telegram",
                "Other",
            ],
        },
        url: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: "",
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const SocialMedia =
    mongoose.models.SocialMedia ||
    mongoose.model("SocialMedia", socialMediaSchema);

export default SocialMedia;