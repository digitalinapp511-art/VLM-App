import { apiClient } from "@/lib/api-client";
import type { Role, VerifyOtpResponse } from "@/types";

export const authApi = {
  sendOtp: async (email: string, purpose: string = "login") => {
    const { data } = await apiClient.post("/auth/send-otp", { email, purpose });
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
    const { data } = await apiClient.post("/auth/logout");
    localStorage.removeItem("vlm_token");
    return data;
  },

  getGoogleAuthUrl: async (): Promise<{ url: string }> => {
    const { data } = await apiClient.get<{ url: string }>("/auth/google");
    return data;
  },
};
