/**
 * use-subscription.ts
 *
 * Central subscription hook — the single source of truth for all subscription
 * state across the app.
 *
 * Usage:
 *   const { isPremium, isFree, hasUsedTrial, canUseHumanChat } = useSubscription();
 *
 * CRITICAL RULES:
 * - isPremium checks BOTH status AND date expiry (prevents ghost-premium bug)
 * - Never check `subscription.status === 'active'` directly in components — always use this hook
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import studentApi from "@/lib/student-api";
import { useStudentProfile } from "./use-student";

export interface SubscriptionState {
  /** Raw status from DB */
  status: "free" | "trial" | "active" | "expired" | "cancelled";
  /** true if status is trial/active AND not past expiry date */
  isPremium: boolean;
  /** true if user has no subscription */
  isFree: boolean;
  /** true if user is on trial right now */
  isTrial: boolean;
  /** Whether user ever started a trial (permanent flag — once true, stays true) */
  hasUsedTrial: boolean;
  /** Days remaining in trial or subscription (null if not applicable) */
  daysLeft: number | null;
  /** When subscription expires (null if free) */
  expiresAt: Date | null;
  /** When trial ends (null if not on trial) */
  trialEndsAt: Date | null;
  /** Whether autopay is active */
  autopayEnabled: boolean;
  /** Whether user has requested cancel-at-period-end */
  cancelAtPeriodEnd: boolean;
  /** Plan name */
  planName: string | null;
  /** Plan price */
  planPrice: number | null;

  // ── Feature gates — use these in UI, NOT isPremium directly ──────────────
  /** AI Chat is always available (token-based for free users, unlimited for premium) */
  canUseAiChat: boolean;
  /** Human teacher chat requires premium */
  canUseHumanChat: boolean;
  /** Audio calls require premium */
  canUseCall: boolean;
  /** Video calls require premium */
  canUseVideo: boolean;
  /** Library / study materials require premium */
  canUseLibrary: boolean;
  /** MCQ / Quiz require premium */
  canUseQuiz: boolean;
  /** Video upload requires premium */
  canUploadVideo: boolean;
  /** Short video viewing is free; uploading is premium */
  canViewShorts: boolean;

  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  useSubscription — primary hook
// ─────────────────────────────────────────────────────────────────────────────
export function useSubscription(): SubscriptionState {
  const { data: profile, isLoading } = useStudentProfile();
  const profileData = (profile as any)?.data ?? profile;
  const sub = profileData?.subscription;

  const now = new Date();

  // ── Compute actual premium status with date check ─────────────────────────
  const rawStatus: string = sub?.status || "free";
  let trialEndsAt: Date | null = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  let expiresAt: Date | null = sub?.expiresAt ? new Date(sub.expiresAt) : null;

  // isPremium: must be trial/active AND within valid date window
  let isPremium = false;
  if (rawStatus === "trial" && trialEndsAt) {
    isPremium = trialEndsAt > now;
  } else if (rawStatus === "active" && expiresAt) {
    isPremium = expiresAt > now;
  } else if (rawStatus === "active" && !expiresAt) {
    // Has active status but no expiresAt (autopay, will be set by webhook) — give benefit of doubt
    isPremium = true;
  }

  // If cancelAtPeriodEnd is true, user can still use premium until period ends
  const cancelAtPeriodEnd = sub?.cancelAtPeriodEnd || false;

  const status = isPremium
    ? (rawStatus as SubscriptionState["status"])
    : rawStatus === "active" || rawStatus === "trial"
    ? "expired"
    : (rawStatus as SubscriptionState["status"]);

  // ── Days remaining ────────────────────────────────────────────────────────
  let daysLeft: number | null = null;
  if (isPremium) {
    const endDate = rawStatus === "trial" ? trialEndsAt : expiresAt;
    if (endDate) {
      const diffMs = endDate.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  const hasUsedTrial = sub?.hasUsedTrial || false;
  const autopayEnabled = sub?.autopayEnabled || false;
  const planName = sub?.planId?.name || null;
  const planPrice = sub?.planId?.price || null;

  return {
    status,
    isPremium,
    isFree: !isPremium,
    isTrial: isPremium && rawStatus === "trial",
    hasUsedTrial,
    daysLeft,
    expiresAt,
    trialEndsAt,
    autopayEnabled,
    cancelAtPeriodEnd,
    planName,
    planPrice,

    // Feature gates
    canUseAiChat: true,          // Always available (tokens differ per tier)
    canUseHumanChat: isPremium,
    canUseCall: isPremium,
    canUseVideo: isPremium,
    canUseLibrary: isPremium,
    canUseQuiz: isPremium,
    canUploadVideo: isPremium,
    canViewShorts: true,         // Viewing is always free

    isLoading,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  useSubscriptionSync — call on app open to sync Razorpay → DB
// ─────────────────────────────────────────────────────────────────────────────
export function useSubscriptionSync() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: async () => {
      const result = await studentApi.getSubscriptionStatus();
      // Invalidate the profile cache so all hooks see the updated subscription
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      }
      return result?.data;
    },
    // Run on every app open (mount), but only once every 5 minutes max
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    // Only run if user is authenticated
    enabled: !!localStorage.getItem("vlm_token"),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  useCancelSubscription — mutation for self-service cancel
// ─────────────────────────────────────────────────────────────────────────────
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
}
