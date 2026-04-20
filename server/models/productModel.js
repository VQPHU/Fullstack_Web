import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 90,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        ratings: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                comment: {
                    type: String,
                    default: "",
                },
                status: {
                    type: String,
                    enum: ["pending", "approved"],
                    default: "pending",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        averageRating: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
            // required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Category",
        },
        productType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductType",
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Brand",
        },
    },
    {
        timestamps: true,
    }
);

// Calulate average rating before saving 
productSchema.pre("save", function (next) {
    if (this.ratings && this.ratings.length > 0) {
        const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
        this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    }
    next();
});
productSchema.index({ name: "text" });
productSchema.index({ category: 1, brand: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
