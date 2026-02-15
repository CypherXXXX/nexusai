import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

export function setApiUserId(userId: string | null) {
    if (userId) {
        api.defaults.headers.common["X-User-Id"] = userId;
    } else {
        delete api.defaults.headers.common["X-User-Id"];
    }
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);
