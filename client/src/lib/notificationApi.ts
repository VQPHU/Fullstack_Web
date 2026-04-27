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
    const response = await fetch(`${API_BASE_URL}/notification-admin`, {
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

// Types cho Admin Notification (từ backend NotificationAdmin model)
export interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type:
  | "Announcement"
  | "Offer"
  | "Deal"
  | "Promotion"
  | "Alert"
  | "Admin Message"
  | "General";
  priority: "normal" | "high" | "urgent";
  image?: string | null;
  actionButtonText?: string | null;
  actionButtonUrl?: string | null;
  createdAt: string;
  isRead: boolean;
}

// Types dùng để check modal
export const MODAL_TYPES: AdminNotification["type"][] = [
  "Announcement",
  "Alert",
  "Admin Message",
  "Promotion",
  "Deal",
];

interface AdminNotificationsResponse {
  success: boolean;
  notifications?: AdminNotification[];
}

// Lấy danh sách admin notifications của user hiện tại
export const getAdminNotifications = async (
  token: string
): Promise<AdminNotification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notification-admin/my`, {
      headers: getAuthHeaders(token),
    });
    const data = (await response.json()) as AdminNotificationsResponse;

    if (!response.ok || !data.success) {
      throw new Error("Failed to fetch admin notifications");
    }

    return data.notifications || [];
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return [];
  }
};


export const markAdminNotificationRead = async (
  notificationId: string,
  userId: string,
  token: string
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notification-admin/read/${notificationId}/${userId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
};
