import React, { useEffect, useRef, useState, useCallback } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  role: string;
}

interface Salary {
  _id?: string;
  employee: Employee;
  period: string;
  baseSalary: number;
  bonus: number;
  allowance: number;
  tax: number;
  netSalary: number;
  status: "paid" | "unpaid";
}

const ROLE_LABELS: Record<string, string> = {
  call_center: "Call Center",
  packer: "Packer",
  delivery: "Delivery",
  accounts: "Accounts",
  incharge: "Incharge",
};

const getCurrentPeriod = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const Salaries = () => {
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const jspRef = useRef<any>(null);

  const [period, setPeriod] = useState(getCurrentPeriod());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axiosPrivate.get("/employees");
      setEmployees(res.data.employees || []);
    } catch {
      toast.error("Không thể tải danh sách nhân viên");
    }
  };

  // Fetch salaries by period
  const fetchSalaries = useCallback(async (p: string) => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get(`/salaries?period=${p}`);
      setSalaries(res.data || []);
    } catch {
      toast.error("Không thể tải dữ liệu lương");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchSalaries(period);
  }, [period, fetchSalaries]);

  // Build spreadsheet data from employees + salaries
  const buildData = () => {
    return employees.map((emp) => {
      const sal = salaries.find((s) => s.employee._id === emp._id);
      return [
        emp.employeeId,                          // col 0 - readonly
        emp.fullName,                            // col 1 - readonly
        ROLE_LABELS[emp.role] || emp.role,       // col 2 - readonly
        sal?.baseSalary ?? 0,                    // col 3
        sal?.bonus ?? 0,                         // col 4
        sal?.allowance ?? 0,                     // col 5
        `=D${employees.indexOf(emp) + 2}*0.1`,   // col 6 - tax formula (10%)
        `=D${employees.indexOf(emp) + 2}+E${employees.indexOf(emp) + 2}+F${employees.indexOf(emp) + 2}-G${employees.indexOf(emp) + 2}`, // col 7 - net formula
        sal?.status ?? "unpaid",                 // col 8
        emp._id,                                 // col 9 - hidden
      ];
    });
  };

  // Init or re-init jspreadsheet
  useEffect(() => {
    if (!spreadsheetRef.current || employees.length === 0) return;

    // Xóa nội dung cũ và reset ref để tránh lỗi "worksheets are not defined" khi re-init
    if (spreadsheetRef.current) {
      spreadsheetRef.current.innerHTML = "";
    }
    jspRef.current = null;

    const data = buildData();

    const options: any = {
      worksheets: [{
        data,
        columns: [
          { title: "Mã NV", width: 90, readOnly: true, type: "text" },
          { title: "Họ & Tên", width: 180, readOnly: true, type: "text" },
          { title: "Chức vụ", width: 110, readOnly: true, type: "text" },
          { title: "Lương cơ bản", width: 140, type: "numeric", mask: "#,##0", decimal: "." },
          { title: "Thưởng", width: 120, type: "numeric", mask: "#,##0", decimal: "." },
          { title: "Phụ cấp", width: 120, type: "numeric", mask: "#,##0", decimal: "." },
          { title: "Thuế", width: 120, type: "numeric", mask: "#,##0", decimal: "." },
          { title: "Thực lãnh", width: 140, type: "numeric", mask: "#,##0", decimal: ".", readOnly: true },
          {
            title: "Trạng thái", width: 110, type: "dropdown",
            source: ["paid", "unpaid"],
          },
          { title: "ID", width: 0, type: "text", readOnly: true },
        ],
        freezeColumns: 3,
        pagination: 20,
      }],
      tableOverflow: true,
      tableWidth: "100%",
      tableHeight: "calc(100vh - 280px)",
      allowInsertRow: false,
      allowDeleteRow: false,
      allowInsertColumn: false,
      allowDeleteColumn: false,
      columnSorting: true,
      search: true,
      style: {
        A1: "font-weight: bold; background-color: #f0f4ff",
      },
    };

    jspRef.current = jspreadsheet(spreadsheetRef.current, options);
  }, [employees, salaries]);

  // Save all rows to backend via bulk API
  const handleSave = async () => {
    // Trong phiên bản mới, jspreadsheet trả về mảng các worksheet
    if (!jspRef.current || !jspRef.current[0]) return;
    setSaving(true);
    try {
      const rawData = jspRef.current[0].getData();

      const rows = rawData
        .filter((row: any[]) => row[9]) // must have employee _id
        .map((row: any[]) => ({
          employee: row[9],
          baseSalary: parseFloat(String(row[3]).replace(/,/g, "")) || 0,
          bonus: parseFloat(String(row[4]).replace(/,/g, "")) || 0,
          allowance: parseFloat(String(row[5]).replace(/,/g, "")) || 0,
          tax: parseFloat(String(row[6]).replace(/,/g, "")) || 0,
          status: row[8] || "unpaid",
        }));

      await axiosPrivate.post("/salaries/bulk", { period, rows });
      toast.success(`Đã lưu bảng lương kỳ ${period} thành công!`);
      fetchSalaries(period);
    } catch {
      toast.error("Lưu thất bại, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "'IBM Plex Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}>
            💰 Bảng Lương
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
            Quản lý lương nhân viên theo kỳ — hỗ trợ công thức Excel
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Period picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 14px" }}>
            <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>Kỳ:</span>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#0f172a", background: "transparent", cursor: "pointer" }}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: saving ? "#94a3b8" : "#16a34a",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "10px 22px", fontSize: 14, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
            }}
          >
            {saving ? "⏳ Đang lưu..." : "💾 Lưu bảng lương"}
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div style={{
        background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
        padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#1d4ed8",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        💡 <strong>Tip:</strong> Bạn có thể gõ công thức Excel vào ô <strong>Thuế</strong> (ví dụ: <code>=D2*0.1</code> để tính 10% thuế từ lương cơ bản). Cột <strong>Thực lãnh</strong> tự tính tự động.
      </div>

      {/* Spreadsheet */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0",
        overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#94a3b8", fontSize: 15 }}>
            ⏳ Đang tải dữ liệu...
          </div>
        ) : employees.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Chưa có nhân viên nào</div>
          </div>
        ) : (
          <div ref={spreadsheetRef} style={{ minHeight: '500px', width: '100%' }} />
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .jexcel > thead > tr > td { background: #f1f5f9 !important; font-weight: 600 !important; color: #374151 !important; font-size: 13px !important; }
        .jexcel > tbody > tr:hover > td { background: #f8fafc !important; }
        .jexcel > tbody > tr > td { font-size: 13px !important; color: #1e293b !important; }
        .jexcel_pagination { padding: 10px 16px !important; border-top: 1px solid #e2e8f0 !important; }
        .jexcel_search { margin: 10px 16px !important; }
      `}</style>
    </div>
  );
};

export default Salaries;