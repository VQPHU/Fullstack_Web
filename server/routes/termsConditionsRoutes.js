import express from "express";
import { getTermsConditions } from "../controllers/termsConditionsController.js";

const router = express.Router();

router.get("/", getTermsConditions);

export default router;