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
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Home, BookOpen, Play, ClipboardList, User, Crown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/use-subscription";
import SubscriptionGate, { type GatedFeature } from "@/components/subscription/SubscriptionGate";

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

interface StudentBottomNavProps {
  onFabClick?: () => void;
}

export default function StudentBottomNav({ onFabClick }: StudentBottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isPremium } = useSubscription();
  const [selectedGatedFeature, setSelectedGatedFeature] = useState<GatedFeature | null>(null);
  const isShortsPage = pathname === PATHS.SHORT_VIDEO_FEED;

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-[100] bg-white dark:bg-[#110d2c] border-t border-slate-100 dark:border-[#221c4e] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-colors duration-300">
        <div className="max-w-3xl mx-auto flex items-center justify-around px-4 py-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.to;
            const isGated = !isPremium && (item.label === "My Courses" || item.label === "Test Series");

            if (item.isFab) {
              const label = isShortsPage ? "Add" : item.label;
              const icon = isShortsPage ? <Plus size={22} /> : item.icon;
              const clickHandler = (isShortsPage && onFabClick) ? onFabClick : () => navigate(item.to);

              return (
                <button
                  key={item.label}
                  onClick={clickHandler}
                  className="relative flex flex-col items-center justify-end h-12 pb-0.5 w-16 active:scale-95 transition-transform"
                >
                  {/* FAB circle - Half submerged with white/dark border cutout */}
                  <div className="absolute -top-6 h-11 w-11 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-[#110d2c] shadow-sm"
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
                onClick={() => {
                  if (isGated) {
                    setSelectedGatedFeature(item.label === "My Courses" ? "library" : "quiz");
                  } else {
                    navigate(item.to);
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer",
                  isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
                )}
              >
                <div className="relative">
                  {item.icon}
                  {isGated && (
                    <span className="absolute -top-1.5 -right-2 h-3.5 w-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Crown size={9} strokeWidth={2.5} fill="currentColor" />
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-black">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Render Gated Feature Drop-up Modal if triggered */}
      {selectedGatedFeature && (
        <SubscriptionGate feature={selectedGatedFeature} onClose={() => setSelectedGatedFeature(null)}>
          <div />
        </SubscriptionGate>
      )}
    </>
  );
}
