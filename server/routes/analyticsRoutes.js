import express from 'express'
import { admin, protect } from '../middleware/authMiddleware'
import {
    getAnalyticsOverview,
    getProductAnalytics,
    getSalesAnalytics,
   getInventoryAlerts,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(protect);
router.use(admin);


export default router; 