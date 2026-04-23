export interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    role: "admin" | "user" | "deliveryman";
    createdAt: string;
};

export type Brand = {
    _id: string;
    name: string;
    image?: string; // Image is optional 
    createdAt: string;
};

export type Category = {
    _id: string;
    name: string;
    image?: string;
    categoryType: "Featured" | "Hot Categories" | "Top Categories";
    createdAt: string;
};

export type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPercentage: number;
    stock: number;
    averageRating: number;
    image: string;
    category: Category;
    brand: Brand;
    productType?: ProductType;
    createdAt: string;
}

export type Banner = {
    _id: string;
    name: string;
    title: string;
    startFrom: number;
    image: string;
    bannerType: string;
    createdAt: string;
};

export type ProductType = {
    _id: string;
    name: string;
    type: string;
    description?: string;
    status: "Active" | "Inactive";
    color?: string;
    createdAt: string;
};

export interface StatsData {
    counts: {
        users: number;
        products: number;
        categories: number;
        brands: number;
        orders: number;
        totalRevenue: number;
    };
    roles: { name: string; value: number }[];
    categories: { name: string; value: number }[];
    brands: { name: string; value: number }[];
}

// Order-related types
export type ActiveTab = "pending" | "cash" | "orders";

export type OrderStatus = "pending" | "paid" | "completed" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderItem {
    products: {
        _id: string;
        name: string;
        price: number;
        image?: string;
    };
    quantity: number;
    price: number;
}

export interface Order {
    _id: string;
    orderId: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus | string;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    paidAt?: string;
    shippingAddress: {
        street: string;
        city: string;
        country: string;
        postalCode?: string;
        zipCode?: string;
        state?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface StatusHistory {
    status: OrderStatus;
    changedBy: string;
    notes: string;
    createdAt: string;
}

export interface CashSummary {
    totalReceived: number;
    confirmedCount: number;
    pendingToReceive: number;
    pendingOrders: number;
    pendingSubmissions: number;
    pendingSubmissionsCount: number;
    confirmed: number;
    confirmedSubmissions: number;
}

export interface EditableItem {
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

// Analytics types for Account page
export interface InventoryProduct {
    _id: string;
    name: string;
    stock: number;
    price: number;
    images?: string[];
}

export interface BestSellingProduct {
    _id: string;
    productName: string;
    productImage?: string;
    totalSold: number;
    totalRevenue: number;
}

export interface RecentOrder {
    _id: string;
    total: number;
    status: string;
    createdAt: string;
    userId?: { name: string; email: string };
    items: unknown[];
}

export interface MonthlyRevenue {
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
}

export interface OrderStatusBreakdown {
    _id: string;
    count: number;
    totalValue: number;
}

export interface OverviewData {
    overview: {
        totalProducts: number;
        totalOrders: number;
        totalUsers: number;
        totalRevenue: number;
    };
    inventory: {
        lowStockProducts: InventoryProduct[];
        outOfStockProducts: InventoryProduct[];
        lowStockCount: number;
        outOfStockCount: number;
    };
    sales: {
        bestSellingProducts: BestSellingProduct[];
        recentOrders: RecentOrder[];
        monthlyRevenue: MonthlyRevenue[];
        orderStatusBreakdown: OrderStatusBreakdown[];
    };
}

export interface Address {
    _id: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
}

export interface UserWithAddresses extends User {
    addresses: Address[];
}

export type AdsBanner = {
    _id: string;
    name: string;
    title: string | { _id: string; name: string; type: string; color?: string };
    image?: string;
    type: "advertisement" | "promotion" | "banner";
    order: number;
    status: "Active" | "Inactive";
    createdAt: string;
};

// ---- Types ----
export interface Review {
    _id: string;
    productId: string;
    productName: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    rating: number;
    comment: string;
    status: "pending" | "approved";
    createdAt: string;
}

export type EmployeeRole = "incharge" | "call_center" | "accounts" | "delivery" | "packer";

export interface Employee {
    _id: string;
    employeeId: string;
    fullName: string;
    email: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: string;
    hometown?: string;
    university?: string;
    role: EmployeeRole;
    avatar?: string;
    createdAt: string;
}

export interface Salary {
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

export const ROLE_LABELS: Record<EmployeeRole, string> = {
    call_center: "Call Center",
    packer: "Packer",
    delivery: "Delivery",
    accounts: "Accounts",
    incharge: "Incharge",
};

export type SocialMedia = {
    _id: string;
    name: string;
    platform: "Facebook" | "Instagram" | "Twitter" | "LinkedIn" | "YouTube" | "TikTok" | "Pinterest" | "WhatsApp" | "Telegram" | "Other";
    url: string;
    icon?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
};

export type WebsiteIconCategory = "Logo" | "Favicon" | "Social Media" | "Footer" | "Header" | "Other";

export type WebsiteIcon = {
    _id: string;
    name: string;
    key: string;
    category: WebsiteIconCategory;
    imageUrl?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
};

export interface ComponentType {
    _id: string;
    name: string;
    isActive: boolean;
}