import axios from "axios";

// Read API URL from environment variables, fallback to local development URL
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/spms";

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-handle 401 Unauthorized (expired or invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export { BACKEND_URL };
export default api;