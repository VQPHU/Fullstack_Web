import { api } from "@/lib/api";
import { create } from "zustand"
import { persist } from "zustand/middleware"

type User = {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    role: "admin" | "user" | "deliveryman";
};

type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: { email: string; password: string })
        => Promise<void>;
    register: (userData: {
        name: string;
        email: string;
        password: string;
        role: string;
    }) => Promise<void>;
    logout: () => void;
    checkIsAdmin: () => boolean;
};

const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        login: async (credential) => {
            try {
                const response = await api.post("/auth/login", credential)
                if (response.data.token) {
                    // Server returns user data directly, not nested in user object
                    const userData: User = {
                        _id: response.data._id,
                        name: response.data.name,
                        email: response.data.email,
                        avatar: response.data.avatar,
                        role: response.data.role,
                    };
                    set({
                        user: userData,
                        token: response.data.token,
                        isAuthenticated: true,
                    })
                }

            } catch (error) {
                console.error("login error:", error);
                throw error;
            }
        },
        register: async (userData) => {
            try {
                await api.post("/auth/register", userData);
            } catch (error) {
                console.log("resgistration error:", error);
                throw error;
            }
        },
        logout: () => {
            set({
                user: null,
                token: null,
                isAuthenticated: false,
            })
        },
        checkIsAdmin: () => {
            const { user } = get();
            return user?.role === "admin";
        },
    }),
        {
            name: "auth-storage",
        }));

export default useAuthStore;