import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VlmLogo } from "@/components/basic/VlmLogo";
import { PATHS } from "@/routes/paths";

export default function SplashPage() {
  const navigate = useNavigate();

  // ── DEV MODE BYPASS ─────────────────────────────────────
  // Set to true to skip login during development
  const DEV_BYPASS_LOGIN = false;
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      if (DEV_BYPASS_LOGIN) {
        // Inject a mock token and role so auth checks pass
        localStorage.setItem("vlm_token", "dev-mock-token");
        localStorage.setItem("vlm_role", "teacher");
        navigate(PATHS.TEACHER_DASHBOARD, { replace: true });
      } else {
        const token = localStorage.getItem("vlm_token");
        const role = localStorage.getItem("vlm_role");
        if (token && role) {
          if (role === "student") {
            navigate(PATHS.STUDENT_DASHBOARD, { replace: true });
          } else if (role === "teacher") {
            navigate(PATHS.TEACHER_DASHBOARD, { replace: true });
          } else if (role === "parent") {
            navigate(PATHS.COMING_SOON, { replace: true });
          } else {
            navigate(PATHS.ROLE_SELECT, { replace: true });
          }
        } else {
          navigate(PATHS.ROLE_SELECT, { replace: true });
        }
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="vlm-bg flex min-h-svh w-full flex-col items-center justify-center">
      {/* Logo area */}
      <div className="vlm-fade-in flex flex-1 flex-col items-center justify-center">
        <VlmLogo />
      </div>

      {/* Bottom loader */}
      <div
        className="safe-bottom mb-16 flex flex-col items-center gap-4"
        style={{ animation: "vlm-fadeIn 0.6s ease 1s forwards", opacity: 0 }}
      >
        {/* Dot loader */}
        <div className="flex items-center gap-2">
          <span className="vlm-dot" />
          <span className="vlm-dot" />
          <span className="vlm-dot" />
          <span className="vlm-dot" />
        </div>
        <p className="text-sm tracking-wide text-white/50">
          Preparing your dashboard...
        </p>
      </div>
    </div>
  );
}

// ── Inline SVG logo (matches Figma — golden 3‑D lettering + blue mortarboard) ──

