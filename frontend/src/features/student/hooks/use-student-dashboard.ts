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
  const hasToken = !!localStorage.getItem("vlm_token");
  const isBypass = localStorage.getItem("dev_bypass_auth") === "true" && !hasToken;

  // ── Dashboard aggregated data (Includes profile, wallet, subscription, unread counts) ─────────────────
  const { data: dashboardRaw, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();

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
    if (dashboardError) {
      const err = dashboardError as any;
      if (err?.response?.status === 404) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
        return;
      }
    }
    if (dashboardRaw && !isDashboardLoading) {
      const db = (dashboardRaw as any)?.data ?? dashboardRaw;
      const p = db?.student;
      const isIncomplete =
        !p?.fullName &&
        !(p?.firstName) &&
        !p?.nickname;
      if (isIncomplete && p) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
      }
    }
  }, [dashboardRaw, isDashboardLoading, dashboardError, navigate, isBypass]);

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
  const dashboardData = isBypass ? { student: mockProfile } : ((dashboardRaw as any)?.data ?? dashboardRaw ?? {});
  const studentData = dashboardData?.student ?? {};
  const profile = studentData;
  const mcq = isBypass ? mockMcq : ((mcqRaw as any)?.data ?? mcqRaw ?? {});

  const fullNameFromParts = studentData?.firstName 
    ? `${studentData.firstName}${studentData.lastName ? ' ' + studentData.lastName : ''}`
    : '';

  const nickname = studentData?.nickname || studentData?.firstName || studentData?.fullName || fullNameFromParts || "Student";
  const photo = studentData?.profilePhoto || "";
  const totalPoints = studentData?.totalPoints ?? dashboardData?.totalPoints ?? 0;
  const streak = studentData?.streak ?? dashboardData?.streak ?? 0;
  const level = totalPoints > 1500 ? "Platinum" : totalPoints > 500 ? "Gold" : "Silver";
  const lastSpinDate = studentData?.lastSpinDate ?? dashboardData?.lastSpinDate ?? null;
  const activeSecondsSinceLastSpin = isBypass
    ? 2700 // 45 minutes in seconds
    : (studentData?.activeSecondsSinceLastSpin ?? dashboardData?.activeSecondsSinceLastSpin ?? 0);

  // MCQ progress
  const mcqCompleted = dashboardData?.mcq?.completed ?? (mcq?.status === 'completed' ? (mcq?.questions?.length || 15) : 0);
  const mcqTotal = dashboardData?.mcq?.total ?? (mcq?.questions?.length || 15);

  // Live class
  const liveClass = dashboardData?.liveClass ?? null;

  // Online teachers count
  const activeTeachersCount = dashboardData?.activeTeachersCount ?? 0;

  // Pre-aggregated counters for notification and parent requests
  const unreadNotificationCount = dashboardData?.unreadNotificationCount ?? 0;
  const pendingParentRequestCount = dashboardData?.pendingParentRequestCount ?? 0;

  const isLoading = isBypass
    ? false
    : isDashboardLoading;

  return {
    isLoading,
    profile,
    nickname,
    photo,
    totalPoints,
    streak,
    level,
    lastSpinDate,
    activeSecondsSinceLastSpin,
    mcqCompleted,
    mcqTotal,
    liveClass,
    activeTeachersCount,
    unreadNotificationCount,
    pendingParentRequestCount,
  };
}
