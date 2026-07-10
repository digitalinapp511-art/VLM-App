import { apiClient } from "@/lib/api-client";
import type { Role, VerifyOtpResponse } from "@/types";

export const authApi = {
  /** Detect whether the identifier is a 10-digit phone or an email address
   *  and send it in the right field so the backend stores it correctly. */
  sendOtp: async (identifier: string, purpose: string = "login", role?: string) => {
    const isPhone = /^\d{10}$/.test(identifier.trim());
    const body = {
      ...(isPhone ? { mobile: identifier.trim() } : { email: identifier.trim().toLowerCase() }),
      purpose,
      ...(role && { role }),
    };
    const { data } = await apiClient.post("/auth/send-otp", body);
    return data;
  },

  verifyOtp: async (identifier: string, otp: string, role: Role): Promise<VerifyOtpResponse> => {
    const isPhone = /^\d{10}$/.test(identifier.trim());
    const body = {
      ...(isPhone ? { mobile: identifier.trim() } : { email: identifier.trim().toLowerCase() }),
      otp,
      role,
    };
    const { data } = await apiClient.post<VerifyOtpResponse>("/auth/verify-otp", body);
    // Store the short-lived access token
    if (data.accessToken) {
      localStorage.setItem("vlm_token", data.accessToken);
    }
    return data;
  },

  selectRole: async (role: Role) => {
    const { data } = await apiClient.post("/auth/role", { role });
    if (data.accessToken) {
      localStorage.setItem("vlm_token", data.accessToken);
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
