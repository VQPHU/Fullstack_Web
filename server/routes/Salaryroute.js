import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary,
  bulkSaveSalaries,
} from "../controllers/salaryController.js";

const router = express.Router();

router.get("/", protect, admin, getSalaries);
router.get("/:id", protect, admin, getSalaryById);

router.post("/", protect, admin, createSalary);
router.post("/bulk", protect, admin, bulkSaveSalaries); 
router.put("/:id", protect, admin, updateSalary);
router.delete("/:id", protect, admin, deleteSalary);

export default router;