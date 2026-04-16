import express from 'express';
import {
    getOrders,
    getOrderById,
    createOrderFromCart,
    updateOrderStatus,
    deleteOrder,
    getAllOrdersAdmin,
} from "../controllers/orderControllers.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

/**
 * @swagger
 * /api/orders/admin:
 *   get:
 *     summary: Lấy tất cả đơn hàng (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng của user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng từ giỏ hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng theo ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Xoá đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã xoá đơn hàng
 */

/**
 * @swagger
 * /api/orders/{id}/webhook-status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng (Webhook Stripe)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, completed, cancelled]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */


router.route("/admin")
    .get(protect, getAllOrdersAdmin);

router.route("/")
    .get(protect, getOrders)
    .post(protect, createOrderFromCart);

router.route("/:id")
    .get(protect, getOrderById)
    .delete(protect, deleteOrder);  

router.route("/:id/status")
    .put(protect, updateOrderStatus);

router.route("/:id/webhook-status")
    .put(updateOrderStatus);

export default router; 
