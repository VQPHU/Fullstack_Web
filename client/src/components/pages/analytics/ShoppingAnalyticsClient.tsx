"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart, DollarSign, TrendingUp, Package, RefreshCw,
} from "lucide-react";
import { useUserStore } from "@/lib/store";
import { getUserShoppingAnalytics, type ShoppingAnalyticsData } from "@/lib/analyticsApi";
import MonthlySpendingChart from "./MonthlySpendingChart";
import OrderStatusChart from "./OrderStatusChart";
import CategoriesChart from "./CategoriesChart";
import TopProductsTable from "./TopProductsTable";

type TabId = "monthly" | "status" | "categories" | "products";

const TABS: { id: TabId; label: string }[] = [
  { id: "monthly",    label: "Monthly Spending" },
  { id: "status",     label: "Order Status" },
  { id: "categories", label: "Categories" },
  { id: "products",   label: "Top Products" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title, value, subtitle, icon: Icon,
}: {
  title: string; value: string; subtitle: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <Icon className="w-4 h-4 text-gray-300" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ShoppingAnalyticsClient() {
  const { auth_token, hasHydrated } = useUserStore();
  const [data, setData] = useState<ShoppingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("monthly");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserShoppingAnalytics(auth_token || "");
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [auth_token]);

  useEffect(() => {
    if (!hasHydrated) return;
    fetchData();
  }, [fetchData, hasHydrated]);

  if (!hasHydrated || loading) return <LoadingSkeleton />;

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-gray-500 text-sm">Failed to load analytics.</p>
          <button onClick={fetchData} className="text-sm text-teal-600 underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { overview } = data;

  const stats = [
    {
      title: "Total Orders",
      value: String(overview.totalOrders),
      subtitle: `${overview.completedOrders} completed`,
      icon: ShoppingCart,
    },
    {
      title: "Total Spent",
      value: `$${overview.totalSpent.toFixed(2)}`,
      subtitle: `$${overview.paidAmount.toFixed(2)} paid`,
      icon: DollarSign,
    },
    {
      title: "Avg Order Value",
      value: `$${overview.avgOrderValue.toFixed(2)}`,
      subtitle: "Per order average",
      icon: TrendingUp,
    },
    {
      title: "Items Purchased",
      value: String(overview.itemsPurchased),
      subtitle: "Total items bought",
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track your shopping patterns and spending habits
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Tab bar + content */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Tab bar — nền xám, active trắng bo góc */}
          <div className="flex bg-gray-100 p-1 gap-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "monthly"    && <MonthlySpendingChart data={data.monthlySpending} />}
            {activeTab === "status"     && <OrderStatusChart data={data.orderStatusBreakdown} />}
            {activeTab === "categories" && <CategoriesChart data={data.categoryBreakdown} />}
            {activeTab === "products"   && <TopProductsTable data={data.topProducts} />}
          </div>
        </div>

      </div>
    </div>
  );
}
