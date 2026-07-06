/**
 * use-student-dashboard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central data-fetching hook for the Student Dashboard.
 * Combines profile + dashboard API calls into one clean object consumed
 * by the dashboard page and its child components.
 */
import { useQuery } from "@tanstack/react-query";
import { useStudentProfile } from "@/hooks/use-student";
import { studentApi } from "@/lib/student-api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export function useStudentDashboard() {
  const navigate = useNavigate();

  // ── Profile ───────────────────────────────────────────────────────────────
  const {
    data: profileRaw,
    isLoading: isProfileLoading,
    error: profileError,
  } = useStudentProfile();

  // ── Dashboard aggregated data ─────────────────────────────────────────────
  const { data: dashboardRaw, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: studentApi.getDashboard,
    staleTime: 60_000,
  });

  // ── MCQ daily task ────────────────────────────────────────────────────────
  const { data: mcqRaw } = useQuery({
    queryKey: ["student-mcq-daily"],
    queryFn: () => studentApi.getDailyMcq(),
    staleTime: 60_000,
  });

  // ── Redirect guards ───────────────────────────────────────────────────────
  useEffect(() => {
    if (profileError) {
      const err = profileError as any;
      if (err?.response?.status === 404) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
        return;
      }
    }
    if (profileRaw && !isProfileLoading) {
      const p = (profileRaw as any)?.data ?? profileRaw;
      const isIncomplete =
        !p?.fullName ||
        !(p?.className || p?.class) ||
        !p?.board ||
        !p?.nickname;
      if (isIncomplete) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
      }
    }
  }, [profileRaw, isProfileLoading, profileError, navigate]);

  // ── Normalised accessors ──────────────────────────────────────────────────
  const profile = (profileRaw as any)?.data ?? profileRaw ?? {};
  const dashboard = (dashboardRaw as any)?.data ?? dashboardRaw ?? {};
  const mcq = (mcqRaw as any)?.data ?? mcqRaw ?? {};

  const nickname = profile?.nickname || profile?.fullName || "Student";
  const photo = profile?.photo ?? "";
  const totalPoints =
    profile?.wallet?.totalPoints ??
    dashboard?.student?.wallet?.totalPoints ??
    0;
  const streak = profile?.streak ?? dashboard?.student?.streak ?? 0;
  const level = profile?.level ?? dashboard?.student?.level ?? "Silver";
  const lastSpinDate =
    profile?.lastSpinDate ?? dashboard?.student?.lastSpinDate ?? null;

  // MCQ progress
  const mcqCompleted = dashboard?.mcq?.completed ?? mcq?.completed ?? 0;
  const mcqTotal = dashboard?.mcq?.total ?? mcq?.total ?? 5;

  // Live class
  const liveClass = dashboard?.liveClass ?? null;

  // Online teachers count
  const activeTeachersCount = dashboard?.activeTeachersCount ?? 50;

  return {
    isLoading: isProfileLoading || isDashboardLoading,
    profile,
    nickname,
    photo,
    totalPoints,
    streak,
    level,
    lastSpinDate,
    mcqCompleted,
    mcqTotal,
    liveClass,
    activeTeachersCount,
  };
}
