"use client";

import { useState } from "react";
import type { MonthlySpending } from "@/lib/analyticsApi";

interface Props { data: MonthlySpending[] }

const W = 820, H = 320;
const PAD = { top: 20, right: 20, bottom: 44, left: 52 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

function pt(i: number, v: number, len: number, max: number) {
  return {
    x: PAD.left + (i / Math.max(len - 1, 1)) * IW,
    y: PAD.top + IH - (max === 0 ? 0 : (v / max) * IH),
  };
}

function linePath(vals: number[], max: number) {
  return vals.map((v, i) => `${i === 0 ? "M" : "L"}${pt(i, v, vals.length, max).x},${pt(i, v, vals.length, max).y}`).join(" ");
}

function areaPath(vals: number[], max: number) {
  if (!vals.length) return "";
  const pts = vals.map((v, i) => pt(i, v, vals.length, max));
  const base = PAD.top + IH;
  return pts.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")
    + ` L${pts[pts.length - 1].x},${base} L${pts[0].x},${base} Z`;
}

export default function MonthlySpendingChart({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; month: string; paid: number; total: number } | null>(null);

  const maxVal = Math.max(...data.map((d) => d.totalSpent), 1);
  const ySteps = 4;
  const yTicks = Array.from({ length: ySteps + 1 }, (_, i) => ({
    val: (maxVal / ySteps) * i,
    y: PAD.top + IH - (IH / ySteps) * i,
  }));

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-0.5">Monthly Spending Trend</h2>
      <p className="text-xs text-gray-400 mb-5">Your spending pattern over the last 12 months</p>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }} onMouseLeave={() => setTooltip(null)}>
          <defs>
            <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {yTicks.map(({ val, y }) => (
            <g key={val}>
              <line x1={PAD.left} x2={PAD.left + IW} y1={y} y2={y}
                stroke="#e5e7eb" strokeDasharray="4 3" strokeWidth={1} />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
                {val === 0 ? "0" : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
              </text>
            </g>
          ))}

          {/* Base axis */}
          <line x1={PAD.left} x2={PAD.left + IW} y1={PAD.top + IH} y2={PAD.top + IH} stroke="#e5e7eb" strokeWidth={1} />

          {/* Areas */}
          <path d={areaPath(data.map((d) => d.totalSpent), maxVal)} fill="url(#gTotal)" />
          <path d={areaPath(data.map((d) => d.paidAmount), maxVal)} fill="url(#gPaid)" />

          {/* Lines */}
          <path d={linePath(data.map((d) => d.totalSpent), maxVal)} fill="none" stroke="#8b5cf6" strokeWidth={1.8} strokeLinejoin="round" />
          <path d={linePath(data.map((d) => d.paidAmount), maxVal)} fill="none" stroke="#10b981" strokeWidth={1.8} strokeLinejoin="round" />

          {/* Dots + hover zones */}
          {data.map((d, i) => {
            const tp = pt(i, d.totalSpent, data.length, maxVal);
            const pp = pt(i, d.paidAmount, data.length, maxVal);
            return (
              <g key={i}>
                {/* Hover zone */}
                <rect
                  x={tp.x - 22} y={PAD.top} width={44} height={IH}
                  fill="transparent"
                  onMouseEnter={() => setTooltip({ x: tp.x, y: Math.min(tp.y, pp.y) - 12, month: d.month, paid: d.paidAmount, total: d.totalSpent })}
                />
                {/* Vertical line on hover */}
                {tooltip?.month === d.month && (
                  <line x1={tp.x} x2={tp.x} y1={PAD.top} y2={PAD.top + IH} stroke="#e5e7eb" strokeWidth={1} />
                )}
                {/* Dots */}
                <circle cx={tp.x} cy={tp.y} r={4} fill="#8b5cf6" stroke="white" strokeWidth={2} />
                <circle cx={pp.x} cy={pp.y} r={4} fill="#10b981" stroke="white" strokeWidth={2} />
                {/* X label */}
                <text x={tp.x} y={PAD.top + IH + 18} textAnchor="middle" fontSize={10} fill="#9ca3af">
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-white border border-gray-200 shadow-md rounded-xl px-4 py-3 text-xs z-10 min-w-[160px]"
            style={{
              left: `${(tooltip.x / W) * 100}%`,
              top: `${(tooltip.y / H) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-semibold text-gray-800 mb-2">{tooltip.month}</p>
            <p className="text-emerald-500 mb-1">Paid Amount : ${tooltip.paid.toFixed(2)}</p>
            <p className="text-violet-500">Total Spent : ${tooltip.total.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-5 mt-2 justify-end">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
          <span className="text-xs text-gray-500">Total Spent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs text-gray-500">Paid Amount</span>
        </div>
      </div>
    </div>
  );
}