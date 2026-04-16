const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export interface Notification {
  _id: string;
  title: string;
  message: string;
  orderId?: string | null;
  type: "order_placed" | "order_status_changed";
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications?: Notification[];
}

export const getNotifications = async (token: string): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders(token),
    });
    const data = (await response.json()) as NotificationsResponse;

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    return data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const deleteNotification = async (
  id: string,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to delete notification");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete notification",
    };
  }
};

export const clearNotifications = async (
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to clear notifications");
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to clear notifications",
    };
  }
};
