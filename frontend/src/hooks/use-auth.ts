import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import type { LoginPayload, Role } from "@/types";

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ email, purpose = "login" }: { email: string; purpose?: string }) =>
      authApi.sendOtp(email, purpose),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp, role }: { email: string; otp: string; role: Role }) =>
      authApi.verifyOtp(email, otp, role),
    onSuccess: (data) => {
      localStorage.setItem("vlm_token", data.token);
    },
  });
}

// ── Select Role ────────────────────────────────────────────
export function useSelectRole() {
  return useMutation({
    mutationFn: (role: Role) => authApi.selectRole(role),
  });
}

// ── Google OAuth ───────────────────────────────────────────
export function useGoogleAuth() {
  return useMutation({
    mutationFn: authApi.getGoogleAuthUrl,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
}
