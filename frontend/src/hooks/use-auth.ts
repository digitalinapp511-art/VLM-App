import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import type { Role } from "@/types";

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ email, purpose = "login", role }: { email: string; purpose?: string; role?: string }) =>
      authApi.sendOtp(email, purpose, role),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp, role }: { email: string; otp: string; role: Role }) =>
      authApi.verifyOtp(email, otp, role),
    // Token is stored inside authApi.verifyOtp — no need to do it again here
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
