export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface ShippingAddress {
    street: string;
    city: string;
    country: string;
    postalCode: string;
}

export interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    total: number;
    status: "pending" | "paid" | "completed" | "cancelled";
    shippingAddress: ShippingAddress;
    paymentIntentId?: string;
    stripeSessionId?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderResponse {
    success: boolean;
    order: Order;
    message?: string;
}

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}