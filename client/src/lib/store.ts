import { Product } from "@/types/type";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Order } from "./orderApi";
import Cookies from "js-cookie";
import authApi from "./authApi";


// Helper function to map server cart item to local format
interface CartServerItem {
    productId: {
        _id: string;
        name: string;
        description: string;
        price: number;
        discountPercentage?: number;
        stock: number;
        averageRating?: number;
        image?: string;
        category:
        | string
        | {
            _id: string;
            name: string;
            image: string;
            categoryType: string;
        };
        brand:
        | string
        | {
            _id: string;
            name: string;
        };
        ratings?: [];
    };
    quantity: number;
}

interface CartProductWithQuantity {
    product: Product;
    quantity: number;
}

const mapCartItemToProduct = (
    item: CartServerItem
): CartProductWithQuantity => ({
    product: {
        _id: item.productId._id,
        name: item.productId.name,
        description: item.productId.description,
        price: item.productId.price,
        discountPercentage: item.productId.discountPercentage || 0,
        stock: item.productId.stock,
        averageRating: item.productId.averageRating || 0,
        image: item.productId.image || "",
        category:
            typeof item.productId.category === "string"
                ? {
                    _id: item.productId.category,
                    name: "",
                    image: "",
                    categoryType: "",
                }
                : item.productId.category,
        brand:
            typeof item.productId.brand === "string"
                ? { _id: item.productId.brand, name: "" }
                : item.productId.brand,
        ratings: item.productId.ratings || [],
    },
    quantity: item.quantity,
});

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    addresses?: Array<{
        _id: string;
        street: string;
        city: string;
        country: string;
        postalCode: string;
        isDefault: boolean;
    }>;
}

interface UserState {
    authUser: User | null;
    authLoading: boolean;
    auth_token: string | null;
    isAuthenticated: boolean;
    updateUser: (user: User) => void;
    setAuthToken: (token: string | null) => void;
    logoutUser: () => void;
    verifyAuth: () => Promise<void>;
    loadUserData: (token: string) => Promise<void>;
    register: (data: {
        name: string;
        email: string;
        password: string;
        role: string;
    }) => Promise<void>;
}

interface CartState {
    cartItems: Product[];
    cartItemsWithQuantities: Array<{ product: Product; quantity: number }>;
    isLoading: boolean;
    addToCart: (product: Product, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateCartItemQuantity: (
        productId: string,
        quantity: number
    ) => Promise<void>;
    clearCart: () => Promise<void>;
    setCartItems: (items: Array<{ product: Product; quantity: number }>) => void;
    getCartItemQuantity: (productId: string) => number;
    isInCart: (productId: string) => boolean;
    syncCartFromServer: () => Promise<void>;
}


interface OrderState {
    orders: Order[];
    isLoading: boolean;
    addOrder: (order: Order) => void;
    updateOrder: (order: Order) => void;
    loadOrders: (token: string) => Promise<void>;
    getOrdersCount: () => number;
    clearOrders: () => void;
}

interface WishlistState {
    wishlistItems: Product[];
    wishlistIds: string[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    setWishlistItems: (products: Product[]) => void;
    setWishlistIds: (ids: string[]) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
}

interface Currency {
    code: string;
    name: string;
    symbol: string;
    rate: number; // Exchane rate relative to USB 
}

interface CurrencyState {
    selectedCurrency: string;
    currencies: Currency[];
    setCurrency: (currencyCode: string) => void;
    getCurrentCurrency: () => Currency;
    convertPrice: (price: number) => number;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            authUser: null,
            authLoading: false,
            auth_token: Cookies.get("auth_token") || null,
            isAuthenticated: !!Cookies.get("auth_token"),
            updateUser: (user) => {
                set({ authUser: user, isAuthenticated: true });
            },
            setAuthToken: (token) => {
                if (token) {
                    Cookies.set("auth_token", token, {
                        expires: 7,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                    });
                    set({ auth_token: token, isAuthenticated: true });

                    setTimeout(() => {
                        loadAllUserData(token);
                    }, 150);
                } else {
                    Cookies.remove("auth_token");
                    set({ auth_token: null, isAuthenticated: false, authUser: null });
                }
            },

            loadUserData: async (token: string) => {
                try {
                    const promises = [
                        (async () => {
                            try {
                                const { getUserWishlist } = await import("./wishlistApi");
                                const { useWishlistStore } = await import("./store");
                                const wishlistResponse = await getUserWishlist(token);
                                if (wishlistResponse.success) {
                                    useWishlistStore
                                        .getState()
                                        .setWishlistIds(wishlistResponse.wishlist);
                                }
                            } catch (error) {
                                console.warn("Failed to load wishlist on login:", error);
                            }
                        })(),
                        (async () => {
                            try {
                                const { useCartStore } = await import("./store");
                                await useCartStore.getState().syncCartFromServer();
                            } catch (error) {
                                console.warn("Failed to load cart on login:", error);
                            }
                        })(),
                        (async () => {
                            try {
                                const { useOrderStore } = await import("./store");
                                await useOrderStore.getState().loadOrders(token);
                            } catch (error) {
                                console.warn("Failed to load orders on login:", error);
                            }
                        })(),
                    ];

                    await Promise.allSettled(promises);
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            },
            logoutUser: async () => {
                Cookies.remove("auth_token");
                set({ authUser: null, auth_token: null, isAuthenticated: false });

                // Clear wishlist, cart, and orders on logout using dynamic imports
                try {
                    const { useWishlistStore } = await import("./store");
                    useWishlistStore.getState().clearWishlist();
                } catch (error) {
                    console.warn("Store: Failed to clear wishlist on logout:", error);
                }

                try {
                    const { useCartStore } = await import("./store");
                    useCartStore.getState().setCartItems([]);
                } catch (error) {
                    console.warn("Store: Failed to clear cart on logout:", error);
                }

                try {
                    const { useOrderStore } = await import("./store");
                    useOrderStore.getState().clearOrders();
                } catch (error) {
                    console.warn("Store: Failed to clear orders on logout:", error);
                }
            },
            verifyAuth: async () => {
                const token = Cookies.get("auth_token");

                if (!token) {
                    set({ isAuthenticated: false, authUser: null, auth_token: null });
                    return;
                }

                const currentState = get();
                if (currentState.authUser && currentState.isAuthenticated) {
                    return;
                }

                try {
                    const response = await authApi.get("/auth/profile");

                    if (response.data) {
                        set({
                            authUser: response.data,
                            isAuthenticated: true,
                            auth_token: token,
                        });

                        try {
                            const { getUserWishlist } = await import("./wishlistApi");
                            const { useWishlistStore } = await import("./store");

                            const wishlistResponse = await getUserWishlist(token);
                            if (wishlistResponse.success) {
                                useWishlistStore
                                    .getState()
                                    .setWishlistIds(wishlistResponse.wishlist);
                            }
                        } catch (wishlistError) {
                            console.warn("Store: Failed to load wishlist:", wishlistError);
                        }

                        try {
                            const { useCartStore } = await import("./store");
                            await useCartStore.getState().syncCartFromServer();
                        } catch (cartError) {
                            console.warn("Store: Failed to load cart:", cartError);
                        }

                        try {
                            const { useOrderStore } = await import("./store");
                            await useOrderStore.getState().loadOrders(token);
                        } catch (orderError) {
                            console.warn("Store: Failed to load orders:", orderError);
                        }
                    } else {
                        throw new Error("Invalid token");
                    }
                } catch (error) {
                    console.error("Store: Verify auth error:", error);
                    Cookies.remove("auth_token");
                    set({ authUser: null, auth_token: null, isAuthenticated: false });
                }
            },
            register: async (data) => {
                try {
                    const response = await authApi.post("/auth/register", data);

                    if (!response.data) {
                        throw new Error(response.error?.message || "Registration failed");
                    }
                } catch (error) {
                    console.error("Store: Register error:", error);
                    throw error;
                }
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            cartItemsWithQuantities: [],
            isLoading: false,

            addToCart: async (product, quantity = 1) => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { addToCart } = await import("./cartApi");
                    const response = await addToCart(auth_token, product._id, quantity);

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartItemToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Add to cart error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            removeFromCart: async (productId) => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { removeFromCart } = await import("./cartApi");
                    const response = await removeFromCart(auth_token, productId);

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartItemToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Remove from cart error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateCartItemQuantity: async (productId, quantity) => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { updateCartItem } = await import("./cartApi");
                    const response = await updateCartItem(
                        auth_token,
                        productId,
                        quantity
                    );

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartItemToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Update cart item error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            clearCart: async () => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    throw new Error("Authentication required");
                }

                set({ isLoading: true });
                try {
                    const { clearCart } = await import("./cartApi");
                    const response = await clearCart();
                    //  const response = await clearCart(auth_token);

                    if (response.success) {
                        set({
                            cartItemsWithQuantities: [],
                            cartItems: [],
                        });
                    }
                } catch (error) {
                    console.error("Clear cart error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            setCartItems: (items) => {
                set({
                    cartItemsWithQuantities: items,
                    cartItems: items.map((item) => item.product),
                });
            },

            getCartItemQuantity: (productId) => {
                const state = get();
                const item = state.cartItemsWithQuantities.find(
                    (item) => item.product._id === productId
                );
                return item ? item.quantity : 0;
            },

            isInCart: (productId) => {
                const state = get();
                return state.cartItems.some((item) => item._id === productId);
            },

            syncCartFromServer: async () => {
                const { auth_token } = useUserStore.getState();
                if (!auth_token) {
                    set({ cartItems: [], cartItemsWithQuantities: [] });
                    return;
                }

                set({ isLoading: true });
                try {
                    const { getUserCart } = await import("./cartApi");
                    const response = await getUserCart();
                    // const response = await getUserCart(auth_token);

                    if (response.success) {
                        const cartItemsWithQuantities =
                            response.cart.map(mapCartItemToProduct);

                        set({
                            cartItemsWithQuantities,
                            cartItems: cartItemsWithQuantities.map((item) => item.product),
                        });
                    }
                } catch (error) {
                    console.error("Sync cart from server error:", error);
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
// ... (rest of the file remains unchanged: useCartStore, useOrderStore, useWishlistStore, and loadAllUserData)
export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            isLoading: false,
            addOrder: (order) =>
                set((state) => ({ orders: [...state.orders, order] })),
            updateOrder: (order) =>
                set((state) => ({
                    orders: state.orders.map((o) => (o._id === order._id ? order : o)),
                })),
            loadOrders: async (token: string) => {
                set({ isLoading: true });
                try {
                    const { getUserOrders } = await import("./orderApi");
                    const res = await getUserOrders(token) as any;

                    console.log("API orders:", res); // 🔥 debug

                    set({
                        orders: Array.isArray(res) ? res : res.orders || res.data || [],
                        isLoading: false,
                    });
                } catch (error) {
                    console.error("Failed to load orders:", error);
                    set({ orders: [], isLoading: false }); // ✅ luôn reset array
                }
            },
            getOrdersCount: () => get().orders.length,
            clearOrders: () => set({ orders: [] }),
        }),
        {
            name: "order-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlistItems: [],
            wishlistIds: [],
            addToWishlist: (product) =>
                set((state) => {
                    if (!state.wishlistIds.includes(product._id)) {
                        return {
                            wishlistItems: [...state.wishlistItems, product],
                            wishlistIds: [...state.wishlistIds, product._id],
                        };
                    }
                    return state;
                }),
            removeFromWishlist: (productId) =>
                set((state) => ({
                    wishlistItems: state.wishlistItems.filter(
                        (item) => item._id !== productId
                    ),
                    wishlistIds: state.wishlistIds.filter((id) => id !== productId),
                })),
            setWishlistItems: (products) =>
                set({
                    wishlistItems: products,
                    wishlistIds: products.map((product) => product._id),
                }),
            setWishlistIds: (ids) =>
                set((state) => ({
                    wishlistIds: ids,
                    wishlistItems: state.wishlistItems.filter((item) =>
                        ids.includes(item._id)
                    ),
                })),
            clearWishlist: () => set({ wishlistItems: [], wishlistIds: [] }),
            isInWishlist: (productId) => {
                const state = get();
                return state.wishlistIds.includes(productId);
            },
        }),
        {
            name: "wishlist-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const loadAllUserData = async (token: string) => {
    try {
        const promises = [
            (async () => {
                try {
                    const { getUserWishlist } = await import("./wishlistApi");
                    const wishlistResponse = await getUserWishlist(token);
                    if (wishlistResponse.success) {
                        useWishlistStore
                            .getState()
                            .setWishlistIds(wishlistResponse.wishlist);
                    }
                } catch (error) {
                    console.warn("Failed to load wishlist:", error);
                }
            })(),
            (async () => {
                try {
                    await useCartStore.getState().syncCartFromServer();
                } catch (error) {
                    console.warn("Failed to load cart:", error);
                }
            })(),
            (async () => {
                try {
                    await useOrderStore.getState().loadOrders(token);
                } catch (error) {
                    console.warn("Failed to load orders:", error);
                }
            })(),
        ];

        await Promise.allSettled(promises);
    } catch (error) {
        console.error("Error loading user data:", error);
    }
};

// Currency store with 12 different currencies 
export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            selectedCurrency: "USD",
            currencies: [
                { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0 },
                { code: "EUR", name: "Euro", symbol: "€", rate: 0.85 },
                { code: "GBP", name: "British Pound", symbol: "£", rate: 0.73 },
                { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 110.0 },
                { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.25 },
                { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.35 },
                { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.92 },
                { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 6.45 },
                { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 74.5 },
                { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", rate: 84.8 },
                { code: "KRW", name: "South Korean Won", symbol: "₩", rate: 1180.0 },
                { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 1.35 },
            ],

            setCurrency: (currencyCode: string) => {
                set({ selectedCurrency: currencyCode });
            },

            getCurrentCurrency: () => {
                const state = get();
                return (
                    state.currencies.find((c) => c.code === state.selectedCurrency) ||
                    state.currencies[0]
                );
            },

            convertPrice: (price: number) => {
                const state = get();
                const currency = state.getCurrentCurrency();
                return price * currency.rate;
            },
        }),
        {
            name: "currency-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);