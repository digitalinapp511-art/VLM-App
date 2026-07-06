/**
 * StudentLayout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wrapper layout for all student-facing pages.
 * Renders the page content (<Outlet />) above the fixed bottom navigation bar.
 * The new StudentBottomNav matches the VLM Academy mockup design.
 */
import { Outlet } from "react-router-dom";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";

export default function StudentLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-[#f4f6ff]">
      {/* Page content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Fixed bottom nav — appears on every student page */}
      <StudentBottomNav />
    </div>
  );
}
