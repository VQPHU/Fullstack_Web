import mongoose from "mongoose";

const pageComponentSchema = new mongoose.Schema(
    {
        pageType: {
            type: String,
            required: true,
            enum: ["home", "product", "blog", "category", "about"],
        },
        componentType: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        config: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index để query nhanh theo pageType và sắp xếp theo displayOrder
pageComponentSchema.index({ pageType: 1, displayOrder: 1 });

export default mongoose.model("PageComponent", pageComponentSchema);