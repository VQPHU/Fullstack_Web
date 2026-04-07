import axios from "axios";
import type { AxiosInstance } from "axios";

// Configuration utility for Admin API 

interface AdminApiConfig {
    baseURL: string;
    isProduction: boolean;
}

// Get API configuration for Admin 
export const getAdminApiConfig = (): AdminApiConfig => {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
        throw new Error("VITE_API_URL environment variable is not defined");
    }

    const isProduction =
        import.meta.env.VITE_APP_ENV === "production" ||
        import.meta.env.PROD === true;

    return {
        baseURL: `${apiUrl}/api`,
        isProduction,
    };
};

// Create configured axios instance 
const createApiInstance = (): AxiosInstance => {
    const { baseURL } = getAdminApiConfig();

    const instance = axios.create({
        baseURL,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        timeout: 90000,  // 90 seconds timeout 
    });

    instance.interceptors.request.use((config) => {
        const authData = localStorage.getItem("auth-storage");

        if (authData) {
            try {
                const parsedData = JSON.parse(authData);
                const token = parsedData.state?.token;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Error parsing auth data:", error);
            }
        }

        return config;
    });


    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.code === "ERR_NETWORK") {
                console.error("Network Error: Server unreachable");
            }

            if (error.response?.status === 401) {
                localStorage.removeItem("auth-storage");
                window.location.href = "/login";
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

// Add response interceptor for better error handling 
export const adminApi = createApiInstance();

// Admin API endpoints 
export const ADMIN_API_ENDPOINTS = {
    //Auth 
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",

    // Users

    // Products

    //Categories 
} as const;

// Helper function to build query parameters 

export const buildAdminQueryParems = (
    params: Record<string, string | number | boolean | undefined>
): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([Key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(Key, String(value));
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
};

export default adminApi;
