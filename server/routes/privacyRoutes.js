import express from "express";
import { getPrivacy } from "../controllers/privacyController.js";

const router = express.Router();

router.get("/", getPrivacy);

export default router;