import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach token ──────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vlm_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 ──────────────────────
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (localStorage.getItem("dev_bypass_auth") === "true") {
        return Promise.reject(error);
      }
      localStorage.removeItem("vlm_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
