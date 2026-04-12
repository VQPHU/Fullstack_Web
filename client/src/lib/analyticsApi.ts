const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

const parseResponseBody = async <T>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

export interface MonthlySpending {
  month: string;
  totalSpent: number;
  paidAmount: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  totalValue: number;
}

export interface CategoryBreakdown {
  category: string;
  totalSpent: number;
  itemCount: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  totalSpent: number;
  avgPrice: number;
  orderCount: number;
}

export interface AnalyticsOverview {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  paidAmount: number;
  avgOrderValue: number;
  itemsPurchased: number;
}

export interface ShoppingAnalyticsData {
  overview: AnalyticsOverview;
  monthlySpending: MonthlySpending[];
  orderStatusBreakdown: OrderStatusBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  topProducts: TopProduct[];
}

import type { Order } from "./orderApi";

type AnalyticsOrdersResponse = {
  orders?: Order[];
  data?: {
    orders?: Order[];
  };
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const deriveAnalyticsFromOrders = (orders: Order[]): ShoppingAnalyticsData => {
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "paid" || o.status === "completed").length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const paidAmount = orders.filter((o) => o.status === "paid" || o.status === "completed").reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const itemsPurchased = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  const now = new Date();
  const monthlyMap: Record<string, { totalSpent: number; paidAmount: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[`${d.getFullYear()}-${d.getMonth()}`] = { totalSpent: 0, paidAmount: 0 };
  }
  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap[key]) {
      monthlyMap[key].totalSpent += o.total;
      if (o.status === "paid" || o.status === "completed") monthlyMap[key].paidAmount += o.total;
    }
  });
  const monthlySpending: MonthlySpending[] = Object.entries(monthlyMap).map(([key, val]) => ({
    month: MONTH_NAMES[parseInt(key.split("-")[1])],
    ...val,
  }));

  const statusMap: Record<string, { count: number; totalValue: number }> = {};
  orders.forEach((o) => {
    if (!statusMap[o.status]) statusMap[o.status] = { count: 0, totalValue: 0 };
    statusMap[o.status].count += 1;
    statusMap[o.status].totalValue += o.total;
  });
  const orderStatusBreakdown = Object.entries(statusMap).map(([status, val]) => ({ status, ...val }));

  const categoryMap: Record<string, { totalSpent: number; itemCount: number; orderCount: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const cat = item.category || "Uncategorized";
      if (!categoryMap[cat]) categoryMap[cat] = { totalSpent: 0, itemCount: 0, orderCount: 0 };
      categoryMap[cat].totalSpent += item.price * item.quantity;
      categoryMap[cat].itemCount += item.quantity;
      categoryMap[cat].orderCount += 1;
    });
  });
  const categoryBreakdown = Object.entries(categoryMap).map(([category, val]) => ({ category, ...val }));

  const productMap: Record<string, { name: string; image?: string; quantity: number; totalSpent: number; prices: number[]; orderCount: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productMap[item.productId])
        productMap[item.productId] = { name: item.name, image: item.image, quantity: 0, totalSpent: 0, prices: [], orderCount: 0 };
      productMap[item.productId].quantity += item.quantity;
      productMap[item.productId].totalSpent += item.price * item.quantity;
      productMap[item.productId].prices.push(item.price);
      productMap[item.productId].orderCount += 1;
    });
  });
  const topProducts: TopProduct[] = Object.entries(productMap)
    .map(([productId, val]) => ({
      productId, name: val.name, image: val.image, quantity: val.quantity, totalSpent: val.totalSpent,
      avgPrice: val.prices.reduce((a, b) => a + b, 0) / (val.prices.length || 1),
      orderCount: val.orderCount,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    overview: { totalOrders, completedOrders, totalSpent, paidAmount, avgOrderValue, itemsPurchased },
    monthlySpending, orderStatusBreakdown, categoryBreakdown, topProducts,
  };
};

export const getUserShoppingAnalytics = async (token: string): Promise<ShoppingAnalyticsData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const data = await parseResponseBody<AnalyticsOrdersResponse | Order[]>(response);
    if (!response.ok || !data) return null;
    let orders: Order[] = [];
    if (Array.isArray(data)) orders = data;
    else if (Array.isArray(data.orders)) orders = data.orders;
    else if (Array.isArray(data.data?.orders)) orders = data.data.orders;
    return deriveAnalyticsFromOrders(orders);
  } catch (error) {
    console.error("Error fetching shopping analytics:", error);
    return null;
  }
};
