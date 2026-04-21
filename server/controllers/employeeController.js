import asyncHandler from "express-async-handler";
import Employee from "../models/EmployeesModel.js";
import cloudinary from "../config/cloudinary.js";

// GET ALL EMPLOYEES (search + filter)
const getEmployees = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? { fullName: { $regex: req.query.keyword, $options: "i" } }
        : {};

    const roleFilter = req.query.role
        ? { role: req.query.role }
        : {};

    const employees = await Employee.find({
        ...keyword,
        ...roleFilter,
    });

    res.status(200).json({
        success: true,
        count: employees.length,
        employees,
    });
});

// GET EMPLOYEE BY ID
const getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
        res.status(200).json({
            success: true,
            employee,
        });
    } else {
        res.status(404);
        throw new Error("Employee not found");
    }
});

// CREATE EMPLOYEE
const createEmployee = asyncHandler(async (req, res) => {
    const {
        employeeId,
        fullName,
        email,
        gender,
        dateOfBirth,
        hometown,
        university,
        role,
        avatar,
    } = req.body;

    const exists = await Employee.findOne({
        $or: [{ email }, { employeeId }],
    });

    if (exists) {
        res.status(400);
        throw new Error("Employee already exists");
    }

    let avatarUrl = "";

    if (avatar) {
        const result = await cloudinary.uploader.upload(avatar, {
            folder: "employees/avatars",
        });
        avatarUrl = result.secure_url;
    }

    const employee = await Employee.create({
        employeeId,
        fullName,
        email,
        gender,
        dateOfBirth,
        hometown,
        university,
        role,
        avatar: avatarUrl,
    });

    res.status(201).json({
        success: true,
        employee,
    });
});

// UPDATE EMPLOYEE
const updateEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
        res.status(404);
        throw new Error("Employee not found");
    }

    employee.fullName = req.body.fullName || employee.fullName;
    employee.email = req.body.email || employee.email;
    employee.gender = req.body.gender || employee.gender;
    employee.dateOfBirth = req.body.dateOfBirth || employee.dateOfBirth;
    employee.hometown = req.body.hometown || employee.hometown;
    employee.university = req.body.university || employee.university;
    employee.role = req.body.role || employee.role;

    if (req.body.avatar && req.body.avatar !== employee.avatar) {
        const result = await cloudinary.uploader.upload(req.body.avatar, {
            folder: "employees/avatars",
        });
        employee.avatar = result.secure_url;
    }

    const updated = await employee.save();

    res.status(200).json({
        success: true,
        employee: updated,
    });
});

// DELETE EMPLOYEE
const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
        res.status(404);
        throw new Error("Employee not found");
    }

    await employee.deleteOne();

    res.status(200).json({
        success: true,
        message: "Employee deleted successfully",
    });
});

export {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};