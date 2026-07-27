import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { PATHS } from "@/routes/paths";
import { isStudentProfileComplete, isTeacherProfileComplete } from "@/lib/auth-helpers";

const STUDENT_ONBOARDING_PATHS = [
  PATHS.CREATE_PROFILE,
  PATHS.STUDENT_PROFILE_SETUP,
  PATHS.ONBOARDING_SLIDES,
  PATHS.SUBJECT_SELECTION,
  PATHS.LEARNING_PLAN,
  PATHS.COUPON,
  PATHS.PLAN_SCREEN,
  PATHS.PAYMENT_FAILED,
];

const TEACHER_ONBOARDING_PATHS = [
  PATHS.TEACHER_REGISTRATION,
  PATHS.QUALIFICATION_DETAILS,
  PATHS.BASICPROFILE_DETAILS,
  PATHS.EXPERIENCE_DETAILS,
  PATHS.TEACHER_SUBJECT_SELECTION,
  PATHS.TEACHERCLASS_SELECTION,
  PATHS.BOARD_SELECTION,
  PATHS.LANGUAGE_SELECTION,
  PATHS.DOCUMENT_UPLOAD,
  PATHS.INTERVIEW_SCHEDULE,
  PATHS.TEACHER_DEMO_VIDEO,
  PATHS.PROFILE_REVIEW,
  PATHS.INTERVIEW_CONFIRMATION,
  PATHS.VERIFICATION_STATUS,
  PATHS.TEACHER_ONBOARDING_WIZARD,
];

export default function ProtectedRoute() {
  const token = localStorage.getItem("vlm_token");
  const location = useLocation();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["currentUserSession"],
    queryFn: authApi.getMe,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!token) {
    return <Navigate to={PATHS.SPLASH} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0b081e] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-white/50 tracking-wider uppercase">Loading account...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    localStorage.removeItem("vlm_token");
    return <Navigate to={PATHS.SPLASH} replace />;
  }

  const role = user.activeRole || user.role || localStorage.getItem("vlm_role") || "student";
  const profile = user.profile;
  const currentPath = location.pathname;

  // Student Profile Completeness Check
  if (role === "student") {
    const isComplete = isStudentProfileComplete(profile);
    const isOnboardingPath = STUDENT_ONBOARDING_PATHS.includes(currentPath as any);

    if (!isComplete && !isOnboardingPath) {
      return <Navigate to={PATHS.CREATE_PROFILE} replace />;
    }
  }

  // Teacher Profile Completeness Check
  if (role === "teacher") {
    const teacherCheck = isTeacherProfileComplete(profile);
    const isOnboardingPath = TEACHER_ONBOARDING_PATHS.includes(currentPath as any);

    if (!teacherCheck.isComplete) {
      if (teacherCheck.status === "draft" && !isOnboardingPath) {
        return <Navigate to={PATHS.BASICPROFILE_DETAILS} replace />;
      }
      if (
        ["submitted", "under_review", "interview_scheduled"].includes(teacherCheck.status) &&
        currentPath === PATHS.TEACHER_DASHBOARD
      ) {
        return <Navigate to={PATHS.VERIFICATION_STATUS} replace />;
      }
    }
  }

  return <Outlet />;
}
