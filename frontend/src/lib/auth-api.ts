import { apiClient } from "@/lib/api-client";
import type { Role, VerifyOtpResponse } from "@/types";

export const authApi = {
  sendOtp: async (email: string, purpose: string = "login", role?: string) => {
    const { data } = await apiClient.post("/auth/send-otp", { email, purpose, ...(role && { role }) });
    return data;
  },

  verifyOtp: async (email: string, otp: string, role: Role): Promise<VerifyOtpResponse> => {
    const { data } = await apiClient.post<VerifyOtpResponse>("/auth/verify-otp", { email, otp, role });
    return data;
  },

  selectRole: async (role: Role) => {
    const { data } = await apiClient.post("/auth/role", { role });
    if (data.token) {
      localStorage.setItem("vlm_token", data.token);
    }
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data.user;
  },

  logout: async () => {
    try {
      const { data } = await apiClient.post("/auth/logout");
      return data;
    } finally {
      // Always clear all VLM session data regardless of API response
      localStorage.removeItem("vlm_token");
      localStorage.removeItem("vlm_role");
      sessionStorage.removeItem("vlm_email");
      sessionStorage.removeItem("vlm_auth_email");
      sessionStorage.removeItem("vlm_sent_otp");
    }
  },

  getGoogleAuthUrl: async (): Promise<{ url: string }> => {
    const { data } = await apiClient.get<{ url: string }>("/auth/google");
    return data;
  },
};
