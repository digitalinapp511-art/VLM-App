import { useEffect } from "react";
import { Outlet } from "react-router-dom";

/**
 * StudentThemeWrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Forces the document root theme to "light" for all student routes on mount,
 * and restores it to the default "dark" theme on unmount.
 *
 * This ensures that student pages look clean, bright, and gamified,
 * while other panels (like teacher/parent) can maintain their dark/gradient aesthetics.
 */
export default function StudentThemeWrapper() {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    const savedTheme = localStorage.getItem("vlm_student_theme") || "light";

    root.classList.remove("light", "dark");
    root.classList.add(savedTheme);

    return () => {
      root.classList.remove("light", "dark");
      // Restore previous theme state when exiting student layout
      if (wasDark) {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    };
  }, []);

  return <Outlet />;
}
