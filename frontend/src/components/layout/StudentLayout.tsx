/**
 * StudentLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wrapper layout for all student-facing pages.
 * Renders the page content (<Outlet />) above the fixed bottom navigation bar.
 * The new StudentBottomNav matches the VLM Academy mockup design.
 */
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";
import { studentApi } from "@/lib/student-api";

export default function StudentLayout() {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const hasToken = !!localStorage.getItem("vlm_token");
        const isBypass = localStorage.getItem("dev_bypass_auth") === "true" && !hasToken;
        if (!isBypass && hasToken) {
          await studentApi.submitUsageHeartbeat();
        }
      } catch (err) {
        console.error("Failed to submit usage heartbeat:", err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-svh flex-col bg-[#f4f6ff]">
      {/* Page content */}
      <div className="flex-1 bg-[#f4f6ff]">
        <Outlet />
      </div>

      {/* Fixed bottom nav — appears on every student page */}
      <StudentBottomNav />
    </div>
  );
}
