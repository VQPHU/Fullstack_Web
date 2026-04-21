import Salary from "../models/Salarymodel.js";
import Employee from "../models/EmployeesModel.js";

// @desc    Lấy tất cả bảng lương (có thể filter theo period)
// @route   GET /api/salaries?period=2024-01
// @access  Admin
export const getSalaries = async (req, res) => {
  try {
    const { period } = req.query;
    const filter = period ? { period } : {};

    const salaries = await Salary.find(filter)
      .populate("employee", "employeeId fullName role gender")
      .sort({ period: -1, createdAt: -1 });

    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy bảng lương theo ID
// @route   GET /api/salaries/:id
// @access  Admin
export const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate(
      "employee",
      "employeeId fullName role gender"
    );

    if (!salary) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }

    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo bảng lương cho nhân viên
// @route   POST /api/salaries
// @access  Admin
export const createSalary = async (req, res) => {
  try {
    const { employee, period, baseSalary, bonus, allowance, tax, status } = req.body;

    // Kiểm tra nhân viên tồn tại
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Kiểm tra đã có bảng lương kỳ này chưa
    const existing = await Salary.findOne({ employee, period });
    if (existing) {
      return res.status(400).json({
        message: `Nhân viên này đã có bảng lương kỳ ${period}`,
      });
    }

    const salary = new Salary({
      employee,
      period,
      baseSalary,
      bonus,
      allowance,
      tax,
      status,
    });

    const created = await salary.save();
    await created.populate("employee", "employeeId fullName role gender");

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật bảng lương
// @route   PUT /api/salaries/:id
// @access  Admin
export const updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }

    const { baseSalary, bonus, allowance, tax, status, period } = req.body;

    if (baseSalary !== undefined) salary.baseSalary = baseSalary;
    if (bonus !== undefined) salary.bonus = bonus;
    if (allowance !== undefined) salary.allowance = allowance;
    if (tax !== undefined) salary.tax = tax;
    if (status !== undefined) salary.status = status;
    if (period !== undefined) salary.period = period;

    const updated = await salary.save(); // pre-save hook tự tính lại netSalary
    await updated.populate("employee", "employeeId fullName role gender");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa bảng lương
// @route   DELETE /api/salaries/:id
// @access  Admin
export const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }

    await salary.deleteOne();
    res.json({ message: "Đã xóa bảng lương thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lưu hàng loạt từ jspreadsheet (bulk save)
// @route   POST /api/salaries/bulk
// @access  Admin
export const bulkSaveSalaries = async (req, res) => {
  try {
    const { period, rows } = req.body;
    // rows: [{ employee, baseSalary, bonus, allowance, tax, status }]

    if (!period || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const results = [];

    for (const row of rows) {
      const { employee, baseSalary, bonus, allowance, tax, status } = row;

      const existing = await Salary.findOne({ employee, period });

      if (existing) {
        // Update nếu đã tồn tại
        existing.baseSalary = baseSalary ?? existing.baseSalary;
        existing.bonus = bonus ?? existing.bonus;
        existing.allowance = allowance ?? existing.allowance;
        existing.tax = tax ?? existing.tax;
        existing.status = status ?? existing.status;
        const updated = await existing.save();
        results.push(updated);
      } else {
        // Tạo mới
        const salary = new Salary({ employee, period, baseSalary, bonus, allowance, tax, status });
        const created = await salary.save();
        results.push(created);
      }
    }

    res.status(200).json({ message: "Lưu thành công", count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};