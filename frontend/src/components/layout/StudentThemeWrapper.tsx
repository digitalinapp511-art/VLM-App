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
    if (wasDark) {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    return () => {
      if (wasDark) {
        root.classList.remove("light");
        root.classList.add("dark");
      }
    };
  }, []);

  return <Outlet />;
}
