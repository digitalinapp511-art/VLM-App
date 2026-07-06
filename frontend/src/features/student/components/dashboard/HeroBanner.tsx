/**
 * HeroBanner.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The large purple gradient hero section at the top of the student dashboard.
 * Shows: greeting, Hindi sub-line, CTA button, and streak / points / level stats.
 *
 * Data: streak, totalPoints, level, nickname from useStudentDashboard hook.
 */
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Flame, Star, Shield, ArrowRight } from "lucide-react";

interface HeroBannerProps {
  nickname: string;
  streak: number;
  totalPoints: number;
  level: string;
}

export default function HeroBanner({
  nickname,
  streak,
  totalPoints,
  level,
}: HeroBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className="relative mx-4 mt-4 rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0a5e 0%, #3b1fa8 50%, #5b35d5 100%)",
        minHeight: 180,
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-purple-400/20 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-blue-400/20 blur-2xl" />

      <div className="relative z-10 p-5 pr-32">
        {/* Greeting */}
        <p className="text-white/70 text-sm font-semibold">
          Hello, <span className="text-yellow-400 font-black">{nickname}!</span> 👋
        </p>
        <p className="text-white/60 text-xs mt-0.5">Aaj kuch naya sikhein?</p>

        {/* CTA */}
        <button
          onClick={() => navigate(PATHS.LIBRARY)}
          className="mt-4 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-5 py-2.5 rounded-full transition-all shadow-lg shadow-yellow-400/30 active:scale-95"
        >
          Continue Learning <ArrowRight size={14} />
        </button>

        {/* Stats row */}
        <div className="mt-5 flex items-center gap-5">
          <StatBadge
            icon={<Flame size={13} className="text-orange-400" />}
            value={streak}
            label="Day Streak"
          />
          <StatBadge
            icon={<Star size={13} className="text-yellow-400" />}
            value={totalPoints.toLocaleString()}
            label="Points"
          />
          <StatBadge
            icon={<Shield size={13} className="text-cyan-400" />}
            value={level}
            label="Level"
          />
        </div>
      </div>

      {/* 3-D mascot */}
      <div
        className="absolute right-2 bottom-0 w-32 h-44 flex items-end justify-center overflow-hidden select-none pointer-events-none"
        aria-hidden
      >
        <img src="/avatar.png" alt="Mascot" className="w-full h-auto object-contain" />
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-white font-black text-sm">{value}</span>
      </div>
      <span className="text-white/50 text-[9px] font-semibold">{label}</span>
    </div>
  );
}
