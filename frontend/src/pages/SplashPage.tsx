import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VlmLogo } from "@/components/basic/VlmLogo";
import { PATHS } from "@/routes/paths";

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(PATHS.ROLE_SELECT, { replace: true });
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

