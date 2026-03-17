import express from 'express'
import { getStats } from "../controllers/statsController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Dashboard statistics APIs
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Lấy thống kê dashboard
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 *       401:
 *         description: Unauthorized
 */


router.route("/").get(protect, getStats);

export default router;