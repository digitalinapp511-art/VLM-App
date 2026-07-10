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
    // Keep track of session start time
    let sessionStartTime = Date.now();

    // Retrieve previous pending active seconds from localStorage
    const getAccumulatedSeconds = (): number => {
      const stored = localStorage.getItem("vlm_accumulated_seconds");
      return stored ? parseInt(stored, 10) : 0;
    };

    const setAccumulatedSeconds = (secs: number) => {
      localStorage.setItem("vlm_accumulated_seconds", secs.toString());
    };

    const syncUsage = async () => {
      const now = Date.now();
      const sessionSeconds = Math.round((now - sessionStartTime) / 1000);
      sessionStartTime = now; // reset session start

      const totalToReport = getAccumulatedSeconds() + sessionSeconds;
      if (totalToReport < 5) return; // Skip tiny slices

      try {
        const hasToken = !!localStorage.getItem("vlm_token");
        const isBypass = localStorage.getItem("dev_bypass_auth") === "true" && !hasToken;

        if (!isBypass && hasToken) {
          // Temporarily reset localStorage value to avoid duplicate submission if parallel trigger fires
          setAccumulatedSeconds(0);

          await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"}/student/usage-heartbeat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("vlm_token")}`
            },
            body: JSON.stringify({ activeSeconds: totalToReport }),
            keepalive: true // Crucial for unload events
          });
        } else {
          // If bypass mode, discard/reset
          setAccumulatedSeconds(0);
        }
      } catch (err) {
        console.error("Failed to sync usage stats:", err);
        // Cache back the un-submitted duration to retry on next sync
        setAccumulatedSeconds(totalToReport);
      }
    };

    // 1. Sync periodically every 5 minutes
    const interval = setInterval(syncUsage, 5 * 60 * 1000);

    // 2. Sync when app goes background or user switches tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        syncUsage();
      } else {
        // User came back: mark new session slice start
        sessionStartTime = Date.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Sync on page unload (close tab or navigate away)
    const handleUnload = () => {
      syncUsage();
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
    };
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
