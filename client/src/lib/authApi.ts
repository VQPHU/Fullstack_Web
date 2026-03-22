const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ApiError = {
  message: string;
  code: string | number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

const getAuthToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies.auth_token;
};

const authApi = {
  post: async (url: string, body: unknown): Promise<ApiResponse> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseURL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            code: response.status === 0 ? "ERR_NETWORK" : response.status,
          },
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch {
      return {
        success: false,
        error: {
          message:
            "Unable to connect to the server. Please check if the server is running.",
          code: "ERR_NETWORK",
        },
      };
    }
  },

  put: async (url: string, body: unknown): Promise<ApiResponse> => {
    try {
      const token = getAuthToken();
      console.log("authApi: PUT", url, "Token:", !!token);
      const response = await fetch(`${baseURL}${url}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        console.error(
          "authApi: PUT error:",
          url,
          response.status,
          errorMessage
        );
        return {
          success: false,
          error: {
            message: errorMessage,
            code: response.status === 0 ? "ERR_NETWORK" : response.status,
          },
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      console.error("authApi: Network Error:", url, error);
      return {
        success: false,
        error: {
          message:
            "Unable to connect to the server. Please check if the server is running.",
          code: "ERR_NETWORK",
        },
      };
    }
  },

  get: async (url: string): Promise<ApiResponse> => {
    try {
      const token = getAuthToken();
      console.log("authApi: GET", url, "Token:", !!token);
      const response = await fetch(`${baseURL}${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        console.error(
          "authApi: GET error:",
          url,
          response.status,
          errorMessage
        );
        return {
          success: false,
          error: {
            message: errorMessage,
            code: response.status === 0 ? "ERR_NETWORK" : response.status,
          },
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      console.error("authApi: Network Error:", url, error);
      return {
        success: false,
        error: {
          message:
            "Unable to connect to the server. Please check if the server is running.",
          code: "ERR_NETWORK",
        },
      };
    }
  },

  delete: async (url: string): Promise<ApiResponse> => {
    try {
      const token = getAuthToken();
      console.log("authApi: DELETE", url, "Token:", !!token);
      const response = await fetch(`${baseURL}${url}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        console.error(
          "authApi: DELETE error:",
          url,
          response.status,
          errorMessage
        );
        return {
          success: false,
          error: {
            message: errorMessage,
            code: response.status === 0 ? "ERR_NETWORK" : response.status,
          },
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      console.error("authApi: Network Error:", url, error);
      return {
        success: false,
        error: {
          message:
            "Unable to connect to the server. Please check if the server is running.",
          code: "ERR_NETWORK",
        },
      };
    }
  },
};

export default authApi;
