const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface WishlistResponse {
  success: boolean;
  wishlist: string[];
  message?: string;
}

export interface WishlistProductsResponse {
  success: boolean;
  products: [];
  message?: string;
}

// Add product to wishlist
export const addToWishlist = async (
  productId: string,
  token: string
): Promise<WishlistResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add to wishlist");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (
  productId: string,
  token: string
): Promise<WishlistResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to remove from wishlist");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

// Get user's wishlist (returns array of product IDs)
export const getUserWishlist = async (
  token: string
): Promise<WishlistResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get wishlist");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting wishlist:", error);
    throw error;
  }
};

// Get wishlist products by IDs
export const getWishlistProducts = async (
  productIds: string[],
  token: string
): Promise<WishlistProductsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get wishlist products");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting wishlist products:", error);
    throw error;
  }
};

// Clear entire wishlist
export const clearWishlist = async (
  token: string
): Promise<WishlistResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to clear wishlist");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    throw error;
  }
};
