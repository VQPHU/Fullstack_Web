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

type ApiBody = {
  message?: string;
  error?: string;
  data?: {
    message?: string;
    error?: string;
    orders?: Order[];
  };
  orders?: Order[];
  order?: Order;
};

const buildApiError = (
  response: Response,
  fallbackMessage: string,
  data?: ApiBody | null
): Error => {
  const messageFromBody =
    data?.message || data?.error || data?.data?.message || data?.data?.error;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Error(
      `${fallbackMessage}. API returned non-JSON response (status ${response.status}). Check NEXT_PUBLIC_API_ENDPOINT.`
    );
  }

  return new Error(messageFromBody || fallbackMessage);
};

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
  paymentMethod?: "card" | "cod";
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

// Create order from cart
export const createOrderFromCart = async (
  token: string,
  cartItems: CartItem[],
  shippingAddress: ShippingAddress,
  paymentMethod: "card" | "cod" = "card"
): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: cartItems,
        shippingAddress,
        paymentMethod,
      }),
    });
    const data = await parseResponseBody<ApiBody>(response);

    if (!response.ok) {
      throw buildApiError(response, "Failed to create order", data);
    }

    if (!data) {
      throw new Error("Failed to create order. Empty API response.");
    }
    console.log("Order created successfully:", data);

    return {
      success: true,
      order: data.order || data,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      order: {} as Order,
      message:
        error instanceof Error ? error.message : "Failed to create order",
    };
  }
};

// Get user orders
export const getUserOrders = async (token: string): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseResponseBody<ApiBody>(response);

    if (!response.ok) {
      throw buildApiError(response, "Failed to fetch orders", data);
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (data && (Array.isArray(data.orders) || Array.isArray(data.data?.orders))) {
      return data.orders || data.data.orders;
    }

    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Get order by ID
export const getOrderById = async (
  orderId: string,
  token: string
): Promise<Order | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseResponseBody<Order>(response);

    if (!response.ok) {
      throw buildApiError(response, "Failed to fetch order", data);
    }

    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

// Delete order
export const deleteOrder = async (
  orderId: string,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseResponseBody<ApiBody>(response);

    if (!response.ok) {
      throw buildApiError(response, "Failed to delete order", data);
    }

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete order",
    };
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "paid" | "completed" | "cancelled",
  token: string,
  paymentIntentId?: string,
  stripeSessionId?: string
): Promise<{ success: boolean; order?: Order; message?: string }> => {
  try {
    const body = JSON.stringify({
      status,
      paymentIntentId,
      stripeSessionId,
    });

    let response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    // Backward-compat for current backend route
    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/orders/${orderId}/webhook-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
    }

    const data = await parseResponseBody<ApiBody>(response);

    if (!response.ok) {
      throw buildApiError(response, "Failed to update order status", data);
    }

    if (!data) {
      throw new Error("Failed to update order status. Empty API response.");
    }
    return {
      success: true,
      order: data.order,
      message: data.message,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    };
  }
};
