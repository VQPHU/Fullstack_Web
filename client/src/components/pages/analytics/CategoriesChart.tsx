"use client";

import type { CategoryBreakdown } from "@/lib/analyticsApi";

interface Props { data: CategoryBreakdown[] }

const BAR_COLORS = ["#8b5cf6","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16"];

const W = 480, H = 260;
const PAD = { top: 16, right: 16, bottom: 44, left: 16 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

export default function CategoriesChart({ data }: Props) {
  const maxSpent = Math.max(...data.map((d) => d.totalSpent), 1);
  const gap = data.length > 0 ? IW / data.length : 60;
  const barW = Math.min(gap * 0.55, 48);

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* Bar chart */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Favorite Categories</h2>
        <p className="text-xs text-gray-400 mb-4">Your top spending categories</p>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 240 }}>
            {/* Dashed grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD.top + IH - t * IH;
              return (
                <line key={t} x1={PAD.left} x2={PAD.left + IW} y1={y} y2={y}
                  stroke="#e5e7eb" strokeDasharray="4 3" strokeWidth={1} />
              );
            })}
            {/* Base axis */}
            <line x1={PAD.left} x2={PAD.left + IW} y1={PAD.top + IH} y2={PAD.top + IH} stroke="#e5e7eb" strokeWidth={1} />

            {data.length === 0 && (
              <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={12} fill="#9ca3af">No category data</text>
            )}

            {data.map((d, i) => {
              const barH = Math.max((d.totalSpent / maxSpent) * IH, 2);
              const x = PAD.left + i * gap + (gap - barW) / 2;
              const y = PAD.top + IH - barH;
              const color = BAR_COLORS[i % BAR_COLORS.length];
              return (
                <g key={d.category}>
                  <rect x={x} y={y} width={barW} height={barH} rx={5} fill={color} opacity={0.8} />
                  {barH > 18 && (
                    <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="#6b7280">
                      ${d.totalSpent >= 1000 ? `${(d.totalSpent / 1000).toFixed(1)}k` : d.totalSpent.toFixed(0)}
                    </text>
                  )}
                  <text x={x + barW / 2} y={PAD.top + IH + 18} textAnchor="middle" fontSize={9} fill="#9ca3af">
                    {d.category.length > 12 ? d.category.slice(0, 12) + "…" : d.category}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Category details */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Category Details</h2>
        <p className="text-xs text-gray-400 mb-4">Items and spending by category</p>
        <div className="space-y-2">
          {data.length === 0 && <p className="text-sm text-gray-400">No category data.</p>}
          {data.map((d) => (
            <div key={d.category} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{d.category}</p>
                <p className="text-xs text-gray-400">{d.itemCount} items</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">${d.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{d.orderCount} orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}