/**
 * StudentBottomNav.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The 5-item bottom navigation bar matching the VLM Academy mockup.
 * Items: Home | My Courses | Ask Doubt (FAB) | Test Series | Profile
 *
 * Usage: place inside the student layout wrapper so it appears on every
 * student screen. The center "Ask Doubt" button is a floating action button
 * with a purple gradient circle.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Home, BookOpen, Play, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  isFab?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    icon: <Home size={20} />,
    to: PATHS.STUDENT_DASHBOARD,
  },
  {
    label: "My Courses",
    icon: <BookOpen size={20} />,
    to: PATHS.LIBRARY,
  },
  {
    label: "Shorts",
    icon: <Play size={22} className="fill-current ml-0.5" />,
    to: PATHS.SHORT_VIDEO_FEED,
    isFab: true,
  },
  {
    label: "Test Series",
    icon: <ClipboardList size={20} />,
    to: PATHS.MCQ,
  },
  {
    label: "Profile",
    icon: <User size={20} />,
    to: PATHS.PROFILE,
  },
];

export default function StudentBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-xl mx-auto flex items-end justify-around px-4 pb-3 pt-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.to;

          if (item.isFab) {
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="relative -top-5 flex flex-col items-center gap-1"
              >
                {/* FAB circle */}
                <div className="h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-400/40 active:scale-90 transition-all"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] font-black text-violet-600">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all",
                isActive ? "text-violet-600" : "text-slate-400"
              )}
            >
              {item.icon}
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isActive ? "text-violet-600" : "text-slate-400"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
