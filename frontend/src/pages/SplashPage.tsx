import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VlmLogo } from "@/components/basic/VlmLogo";
import { PATHS } from "@/routes/paths";
import { authApi } from "@/lib/auth-api";
import { resolveUserProfileRoute } from "@/lib/auth-helpers";

export default function SplashPage() {
  const navigate = useNavigate();

  const DEV_BYPASS_LOGIN = false;

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!isMounted) return;

      if (DEV_BYPASS_LOGIN) {
        localStorage.setItem("vlm_token", "dev-mock-token");
        localStorage.setItem("vlm_role", "teacher");
        navigate(PATHS.TEACHER_DASHBOARD, { replace: true });
        return;
      }

      const token = localStorage.getItem("vlm_token");
      if (token) {
        try {
          const user = await authApi.getMe();
          if (user && isMounted) {
            const targetRoute = resolveUserProfileRoute(user, user.profile);
            navigate(targetRoute, { replace: true });
            return;
          }
        } catch (err) {
          console.error("Failed to verify session on splash:", err);
          localStorage.removeItem("vlm_token");
        }
      }

      if (isMounted) {
        navigate(PATHS.ROLE_SELECT, { replace: true });
      }
    }, 2800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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
