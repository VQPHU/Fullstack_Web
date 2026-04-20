import express from 'express'
import { admin, protect } from '../middleware/authMiddleware.js';
import {
    createProduct, deleteProduct, getProductById,
    getProducts, rateProduct, updateProduct,
    getAllReviews, approveReview, deleteReview
} from '../controllers/productController.js';

const router = express.Router();
router.route("/").get(getProducts).post(protect, admin, createProduct);

// Reviews routes phải đứng TRƯỚC /:id
router.route("/reviews").get(protect, admin, getAllReviews);
router.route("/reviews/:productId/:reviewId/approve").put(protect, admin, approveReview);
router.route("/reviews/:productId/:reviewId").delete(protect, admin, deleteReview);

router.route("/:id/rate").post(protect, rateProduct);

router
    .route("/:id")
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

export default router;