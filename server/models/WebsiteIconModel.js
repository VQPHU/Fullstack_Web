import mongoose from "mongoose";

const websiteIconSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        key: {
            type: String,
            required: true,
            unique: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Logo",
                "Favicon",
                "Social Media",
                "Footer",
                "Header",
                "Other",
            ],
        },
        imageUrl: {
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

const WebsiteIcon =
    mongoose.models.WebsiteIcon ||
    mongoose.model("WebsiteIcon", websiteIconSchema);

export default WebsiteIcon;