// models/adsBannerModel.js
import mongoose from "mongoose";

const adsBannerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductType",   // 👈 trỏ đến model cha
            required: true,
        },
        image: {
            type: String,
        },
        type: {
            type: String,
            enum: ["advertisement", "promotion", "banner"],
            default: "advertisement",
        },
        order: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

const AdsBanner = mongoose.model("AdsBanner", adsBannerSchema);
export default AdsBanner;