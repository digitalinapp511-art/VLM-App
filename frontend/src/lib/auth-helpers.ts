import { PATHS } from "@/routes/paths";

export function isStudentProfileComplete(profile: any): boolean {
  if (!profile) return false;
  if (profile.onboardingCompleted === false) return false;
  const fn = (profile.firstName || "").trim().toLowerCase();
  if (!fn || fn === "student") return false;
  if (!profile.class || !profile.board) return false;
  return true;
}

export function isTeacherProfileComplete(profile: any): { isComplete: boolean; status: string; targetPath: string } {
  if (!profile) {
    return { isComplete: false, status: "draft", targetPath: PATHS.BASICPROFILE_DETAILS };
  }
  const status = profile.applicationStatus || "draft";

  if (status === "draft") {
    return { isComplete: false, status: "draft", targetPath: PATHS.BASICPROFILE_DETAILS };
  }
  if (status === "submitted" || status === "under_review" || status === "interview_scheduled" || status === "pending_interview" || status === "interview_pending" || status === "rejected") {
    return { isComplete: false, status, targetPath: PATHS.VERIFICATION_STATUS };
  }
  if (status === "approved" || profile.isApproved) {
    return { isComplete: true, status: "approved", targetPath: PATHS.TEACHER_DASHBOARD };
  }

  return { isComplete: false, status, targetPath: PATHS.BASICPROFILE_DETAILS };
}

export function resolveUserProfileRoute(user: any, profile: any): string {
  const role = user?.activeRole || user?.role || localStorage.getItem("vlm_role") || "student";

  if (role === "student") {
    if (!isStudentProfileComplete(profile)) {
      return PATHS.CREATE_PROFILE;
    }
    return PATHS.STUDENT_DASHBOARD;
  }

  if (role === "teacher") {
    const teacherCheck = isTeacherProfileComplete(profile);
    return teacherCheck.targetPath;
  }

  if (role === "parent") {
    const linkedChildren = profile?.linkedChildren || [];
    if (linkedChildren.length === 0) {
      return PATHS.ADD_CHILD;
    }
    const hasApproved = linkedChildren.some((c: any) => c.status === "approved");
    if (hasApproved) {
      return PATHS.PARENT_DASHBOARD;
    }
    return PATHS.PARENT_PENDING_APPROVAL;
  }

  return PATHS.ROLE_SELECT;
}
