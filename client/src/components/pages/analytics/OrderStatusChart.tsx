"use client";

import type { OrderStatusBreakdown } from "@/lib/analyticsApi";

interface Props { data: OrderStatusBreakdown[] }

const STATUS_COLOR: Record<string, string> = {
  pending:   "#f59e0b",
  paid:      "#10b981",
  completed: "#3b82f6",
  cancelled: "#ef4444",
};

const STATUS_ICON: Record<string, string> = {
  pending:   "🕐",
  paid:      "✅",
  completed: "📦",
  cancelled: "❌",
};

function PieChart({ data }: { data: OrderStatusBreakdown[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0)
    return <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No orders yet</div>;

  const cx = 90, cy = 90, r = 72;
  let cum = 0;
  const slices = data.map((d) => {
    const start = (cum / total) * Math.PI * 2 - Math.PI / 2;
    cum += d.count;
    const end = (cum / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const large = d.count / total > 0.5 ? 1 : 0;
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`, color: STATUS_COLOR[d.status] || "#94a3b8" };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" className="w-36 h-36 flex-shrink-0">
        {slices.map((s) => (
          <path key={s.status} d={s.path} fill={s.color} stroke="white" strokeWidth={2} />
        ))}
        <circle cx={cx} cy={cy} r={28} fill="white" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="#374151" fontWeight="600">{total}</text>
      </svg>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLOR[d.status] || "#94a3b8" }} />
            <span className="text-xs text-gray-500 capitalize">{d.status}: {d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderStatusChart({ data }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* Left - Pie */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Order Status Distribution</h2>
        <p className="text-xs text-gray-400 mb-5">Breakdown of your orders by status</p>
        <PieChart data={data} />
      </div>

      {/* Right - Summary */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Status Summary</h2>
        <p className="text-xs text-gray-400 mb-4">Detailed breakdown by order status</p>
        <div className="space-y-2">
          {data.length === 0 && <p className="text-sm text-gray-400">No orders found.</p>}
          {data.map((d) => (
            <div key={d.status} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span style={{ color: STATUS_COLOR[d.status] || "#94a3b8" }}>{STATUS_ICON[d.status] || "📋"}</span>
                <span className="text-sm font-medium text-gray-700 capitalize">{d.status}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{d.count} orders</p>
                <p className="text-xs text-gray-400">${d.totalValue.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}