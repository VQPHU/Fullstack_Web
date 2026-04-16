import mongoose from "mongoose";

const productTypeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        color: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("ProductType", productTypeSchema);
