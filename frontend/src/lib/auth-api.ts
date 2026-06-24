import { apiClient } from "@/lib/api-client";
import type { LoginPayload, Role, VerifyOtpResponse } from "@/types";

export const authApi = {
  sendOtp: async (payload: LoginPayload) => {
    const { data } = await apiClient.post("/auth/sent-otp", payload);
    return data;
  },

  verifyOtp: async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    const { data } = await apiClient.post<VerifyOtpResponse>("/auth/otp/verify", { phone, otp });
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
