export const DEFAULT_TEACHER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=VLMTeacherDefault";
export const DEFAULT_STUDENT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=VLMStudentDefault";
export const DEFAULT_PARENT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=VLMParentDefault";

/**
 * Returns a consistent avatar URL across the application.
 * If photoUrl is provided, it returns photoUrl.
 * Otherwise, it uses a deterministic seed (or role default) so the avatar is 100% identical on all pages.
 */
export function getAvatarUrl(
  photoUrl?: string | null,
  identifier?: string | null,
  role: "teacher" | "student" | "parent" = "teacher"
): string {
  if (photoUrl && typeof photoUrl === "string" && photoUrl.trim() !== "") {
    return photoUrl;
  }

  if (identifier && typeof identifier === "string" && identifier.trim() !== "") {
    const sanitized = identifier.trim().toLowerCase();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sanitized)}`;
  }

  if (role === "student") return DEFAULT_STUDENT_AVATAR;
  if (role === "parent") return DEFAULT_PARENT_AVATAR;
  return DEFAULT_TEACHER_AVATAR;
}
