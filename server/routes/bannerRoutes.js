import express from 'express'
import {
    getBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
} from "../controllers/bannerControllers.js"
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Banner management APIs
 */

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Lấy danh sách banners
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Danh sách banner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Banner'
 */

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Tạo banner mới (Admin)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BannerInput'
 *     responses:
 *       201:
 *         description: Tạo banner thành công
 */

/**
 * @swagger
 * /api/banners/{id}:
 *   get:
 *     summary: Lấy banner theo ID
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của banner
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Banner'
 */

/**
 * @swagger
 * /api/banners/{id}:
 *   put:
 *     summary: Cập nhật banner (Admin)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/BannerInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Xoá banner (Admin)
 *     tags: [Banners]
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
 *         description: Xoá thành công
 */

router.route("/")
    .get(getBanners)
    .post(protect, admin, createBanner);
router.route("/:id")
    .get(protect, getBannerById)
    .put(protect, admin, updateBanner)
    .delete(protect, admin, deleteBanner);


export default router;