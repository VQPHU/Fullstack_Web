import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getCart,
    addItemToCart,
    updateCartItem,
    removeItemFromCart,
    clearCart,
} from "../controllers/cartController.js"

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart APIs (Protected)
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Lấy giỏ hàng của user hiện tại
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin giỏ hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartInput'
 *     responses:
 *       200:
 *         description: Thêm vào giỏ thành công
 */

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Xoá toàn bộ giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Giỏ hàng đã được xoá
 */

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Xoá 1 sản phẩm khỏi giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Đã xoá sản phẩm khỏi giỏ
 */

// All cart routes are protected 
router.use(protect);

router.route("/")
    .get(getCart)
    .post(addItemToCart)
    .delete(clearCart);

router.route("/update")
    .put(updateCartItem);

router.route("/:productId").delete(removeItemFromCart);

export default router;