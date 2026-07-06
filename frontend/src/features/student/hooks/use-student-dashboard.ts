/**
 * use-student-dashboard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central data-fetching hook for the Student Dashboard.
 * Combines profile + dashboard API calls into one clean object consumed
 * by the dashboard page and its child components.
 *
 * Fully supports dev_bypass_auth mode to prevent slow/hanging API requests.
 */
import { useDashboard } from "@/hooks/use-student";
import { studentApi } from "@/lib/student-api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useQuery } from "@tanstack/react-query";

export function useStudentDashboard() {
  const navigate = useNavigate();
  const isBypass = localStorage.getItem("dev_bypass_auth") === "true";

  // ── Profile ───────────────────────────────────────────────────────────────
  const {
    data: profileRaw,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: studentApi.getProfile,
    enabled: !isBypass,
  });

  // ── Dashboard aggregated data ─────────────────────────────────────────────
  const { data: dashboardRaw, isLoading: isDashboardLoading } = useDashboard();

  // ── MCQ daily task ────────────────────────────────────────────────────────
  const { data: mcqRaw, isLoading: isMcqLoading } = useQuery({
    queryKey: ["student-mcq-daily"],
    queryFn: () => studentApi.getDailyMcq(),
    staleTime: 60_000,
    enabled: !isBypass,
  });

  // ── Redirect guards (skipped in bypass mode) ──────────────────────────────
  useEffect(() => {
    if (isBypass) return;
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
  }, [profileRaw, isProfileLoading, profileError, navigate, isBypass]);

  // Mock fallbacks for dev bypass mode
  const mockProfile = {
    fullName: "Rahul Sharma",
    nickname: "Rahul",
    class: "10th",
    className: "10th",
    board: "CBSE",
    streak: 5,
    wallet: { totalPoints: 1250 },
    level: "Gold",
    photo: ""
  };
  const mockMcq = { completed: 8, total: 10 };

  // ── Normalised accessors ──────────────────────────────────────────────────
  const profile = isBypass ? mockProfile : ((profileRaw as any)?.data ?? profileRaw ?? {});
  const dashboard = (dashboardRaw as any)?.data ?? dashboardRaw ?? {};
  const studentData = dashboard?.student ?? {};
  const mcq = isBypass ? mockMcq : ((mcqRaw as any)?.data ?? mcqRaw ?? {});

  const nickname = profile?.nickname || profile?.fullName || studentData?.nickname || studentData?.fullName || "Student";
  const photo = profile?.profilePhoto || profile?.photo || studentData?.profilePhoto || "";
  const totalPoints =
    profile?.wallet?.totalPoints ??
    studentData?.wallet?.totalPoints ??
    dashboard?.wallet?.totalPoints ??
    dashboard?.totalPoints ??
    0;
  const streak = profile?.streak ?? studentData?.streak ?? dashboard?.streak ?? 0;
  const level = profile?.level ?? studentData?.level ?? dashboard?.level ?? "Silver";
  const lastSpinDate =
    profile?.lastSpinDate ?? studentData?.lastSpinDate ?? dashboard?.lastSpinDate ?? null;

  // MCQ progress
  const mcqCompleted = dashboard?.mcq?.completed ?? mcq?.completed ?? 0;
  const mcqTotal = dashboard?.mcq?.total ?? mcq?.total ?? 5;

  // Live class
  const liveClass = dashboard?.liveClass ?? null;

  // Online teachers count
  const activeTeachersCount = dashboard?.activeTeachersCount ?? 50;

  const isLoading = isBypass
    ? false
    : (isProfileLoading || isDashboardLoading || isMcqLoading);

  return {
    isLoading,
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
