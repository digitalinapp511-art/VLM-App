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
    to: PATHS.COMING_SOON,
  },
  {
    label: "Profile",
    icon: <User size={20} />,
    to: PATHS.PROFILE,
  },
];

import { Plus } from "lucide-react";

interface StudentBottomNavProps {
  onFabClick?: () => void;
}

export default function StudentBottomNav({ onFabClick }: StudentBottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isShortsPage = pathname === PATHS.SHORT_VIDEO_FEED;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-[#110d2c] border-t border-slate-100 dark:border-[#221c4e] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-colors duration-300">
      <div className="max-w-3xl mx-auto flex items-center justify-around px-4 py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.to;

          if (item.isFab) {
            const label = isShortsPage ? "Add" : item.label;
            const icon = isShortsPage ? <Plus size={22} /> : item.icon;
            const clickHandler = (isShortsPage && onFabClick) ? onFabClick : () => navigate(item.to);

            return (
              <button
                key={item.label}
                onClick={clickHandler}
                className="relative flex flex-col items-center justify-end h-11 pb-0.5 w-16 active:scale-95 transition-transform"
              >
                {/* FAB circle - Half submerged with white/dark border cutout */}
                <div className="absolute -top-5 h-11 w-11 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-[#110d2c] shadow-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  {icon}
                </div>
                <span className="text-[9px] font-black text-violet-600 dark:text-violet-400">
                  {label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all",
                isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
              )}
            >
              {item.icon}
              <span className="text-[9px] font-black">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
