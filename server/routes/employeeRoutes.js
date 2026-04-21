import express from "express";


import { protect, admin } from "../middleware/authMiddleware.js";
import { createEmployee, deleteEmployee, getEmployeeById, getEmployees, updateEmployee } from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", protect, admin, getEmployees);
router.get("/:id", protect, admin, getEmployeeById);

router.post("/", protect, admin, createEmployee);
router.put("/:id", protect, admin, updateEmployee);
router.delete("/:id", protect, admin, deleteEmployee);

export default router;