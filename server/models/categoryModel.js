import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: false, // Image is optional
    },
    categoryType: {
        type: String,
        required: true,
        enum: ["Featured", "Hot Categories", "Top Categories"],
    },
},
    {
        timestamps: true,
    })

export default mongoose.model("Category", categorySchema);

