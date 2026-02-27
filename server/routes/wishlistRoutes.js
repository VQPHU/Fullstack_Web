import express from 'express';
import {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlistProducts,
    clearWishlist,
} from "../controllers/wishlistControllers.js"
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//Get user's wishlist 
router.route("/")
    .get(protect, getUserWishlist);

// add product to wishlist 
router.route("/add")
    .post(protect, addToWishlist);

// remove product from wishlist 
router.route("/remove")
    .delete(protect, removeFromWishlist);

// Get wishlist products with details 
router.route("/products")
    .post(protect, getWishlistProducts);

// DELETE /api/wishlist/clear
router.delete("/clear", protect, clearWishlist);

export default router;  