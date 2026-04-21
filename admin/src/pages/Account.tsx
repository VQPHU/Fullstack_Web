import React from 'react'
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
  Star,
  AlertTriangle,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { OverviewData, InventoryProduct, BestSellingProduct, RecentOrder, MonthlyRevenue, OrderStatusBreakdown } from "@/lib/type";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#10b981",
  completed: "#3b82f6",
  cancelled: "#ef4444",
  refunded: "#8b5cf6",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// ─── Animation Variants ───────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all duration-200 bg-white group cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
          View all <ArrowUpRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );

  return href ? <Link to={href}>{inner}</Link> : inner;
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-600">{icon}</span>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
      <AlertTriangle className="w-8 h-8 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
      status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200" :
        status === "cancelled" ? "bg-red-50 text-red-600 border-red-200" :
          status === "refunded" ? "bg-purple-50 text-purple-600 border-purple-200" :
            "bg-amber-50 text-amber-600 border-amber-200";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {status}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-gray-900">{fmt(payload[0].value)}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Account = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  const fetchData = useCallback(async () => {
    try {
      const res = await axiosPrivate.get("/analytics/overview");
      setData(res.data.data);
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived chart data ──
  const chartMonthly =
    data?.sales.monthlyRevenue.map((m) => ({
      name: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue,
      orders: m.orders,
    })) ?? [];

  const chartStatus =
    data?.sales.orderStatusBreakdown.map((s) => ({
      name: s._id,
      value: s.count,
    })) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
        <OverviewSkeleton />
      </div>
    );
  }

  const { overview, inventory, sales } = data!;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <motion.div variants={item} className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Overview</h1>
            <p className="text-gray-600 my-0.5">
              Complete analytics and insights for your e-commerce business
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 bg-white rounded-lg px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last 30 days
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={fmt(overview.totalRevenue)}
            sub="From paid & completed orders"
            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            color="bg-emerald-50"
          />
          <StatCard
            title="Total Orders"
            value={overview.totalOrders}
            sub="All time orders"
            icon={<ShoppingCart className="w-4 h-4 text-blue-600" />}
            color="bg-blue-50"
            href="/dashboard/orders"
          />
          <StatCard
            title="Total Products"
            value={overview.totalProducts}
            sub={`${inventory.lowStockCount} low stock alerts`}
            icon={<Package className="w-4 h-4 text-violet-600" />}
            color="bg-violet-50"
            href="/dashboard/products"
          />
          <StatCard
            title="Total Users"
            value={overview.totalUsers}
            sub="Registered accounts"
            icon={<Users className="w-4 h-4 text-amber-600" />}
            color="bg-amber-50"
            href="/dashboard/users"
          />
        </motion.div>

        {/* ── Charts Row ── */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800">Monthly Revenue</h3>
            </div>
            {chartMonthly.length === 0 ? (
              <EmptyState message="No sales data available" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartMonthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                    dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Order Status Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800">Order Status</h3>
            </div>
            {chartStatus.length === 0 ? (
              <EmptyState message="No sales data available" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={chartStatus}
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartStatus.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v, "orders"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* ── Best Selling + Recent Orders ── */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Best Selling Products */}
          <SectionCard title="Best Selling Products" icon={<Star className="w-4 h-4" />}>
            {sales.bestSellingProducts.length === 0 ? (
              <EmptyState message="No sales data available" />
            ) : (
              <div className="space-y-3">
                {sales.bestSellingProducts.slice(0, 5).map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                    {p.productImage ? (
                      <img src={p.productImage} alt={p.productName} className="w-9 h-9 rounded-lg object-cover bg-gray-50" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.productName}</p>
                      <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{fmt(p.totalRevenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Recent Orders */}
          <SectionCard title="Recent Orders" icon={<Clock className="w-4 h-4" />}>
            {sales.recentOrders.length === 0 ? (
              <EmptyState message="No sales data available" />
            ) : (
              <div className="space-y-1">
                {sales.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-gray-700 truncate">#{order._id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
                      <p className="text-sm font-semibold text-gray-900">{fmt(order.total)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <StatusBadge status={order.status} />
                      <Link
                        to={`/dashboard/orders`}
                        className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </div>
                  </div>
                ))}
                <Link
                  to="/dashboard/orders"
                  className="block text-center text-xs font-medium text-indigo-500 hover:text-indigo-700 pt-3 transition-colors"
                >
                  View All Orders
                </Link>
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* ── Product Performance Insights ── */}
        <motion.div variants={item}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Product Performance Insights</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stale Products */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">
                    Stale Products ({inventory.lowStockProducts.length})
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Products with no sales in the last 90 days</p>

                {inventory.lowStockProducts.length === 0 ? (
                  <EmptyState message="No stale products" />
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {inventory.lowStockProducts.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                        </div>
                        <Link
                          to="/dashboard/products"
                          className="ml-3 text-xs font-medium text-indigo-500 hover:text-indigo-700 flex items-center gap-1 shrink-0 transition-colors"
                        >
                          Review
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* No Sales Products */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    No Sales ({inventory.outOfStockProducts.length})
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Products that have never been sold</p>

                {inventory.outOfStockProducts.length === 0 ? (
                  <EmptyState message="No sales data available" />
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {inventory.outOfStockProducts.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{fmt(p.price)} · Stock: {p.stock}</p>
                        </div>
                        <Link
                          to="/dashboard/products"
                          className="ml-3 text-xs font-medium text-indigo-500 hover:text-indigo-700 flex items-center gap-1 shrink-0 transition-colors"
                        >
                          Review
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Account