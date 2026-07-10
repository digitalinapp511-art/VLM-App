/**
 * LiveSupportBanner.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The green "24x7 Live Teacher Support" strip.
 * Shows active teachers count from backend and navigates to AskDoubt.
 */
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Headphones } from "lucide-react";

interface LiveSupportBannerProps {
  activeTeachersCount: number;
}

export default function LiveSupportBanner({
  activeTeachersCount,
}: LiveSupportBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="mx-0 w-full bg-[#f0fdf4] rounded-2xl border border-green-100 shadow-sm p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
      {/* Left icon */}
      <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
        <Headphones className="text-green-600 h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-800 text-xs sm:text-sm leading-tight">
          24x7 Live Teacher Support
        </p>
        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-snug">
          Ab doubt hoga turant clear!
        </p>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
          {/* Tiny avatar stack */}
          <div className="flex -space-x-1.5">
            {["🧑‍🏫", "👩‍🏫", "🧑‍🏫"].map((e, i) => (
              <div
                key={i}
                className="h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[8px] sm:text-[9px]"
              >
                {e}
              </div>
            ))}
          </div>
          <span className="text-[8px] sm:text-[10px] text-green-600 font-bold">
            ● {activeTeachersCount > 0 ? (activeTeachersCount < 5 ? `${activeTeachersCount} Teacher${activeTeachersCount > 1 ? 's' : ''} Online` : `${activeTeachersCount}+ Teachers Online`) : "No Teachers Online"}
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate(PATHS.ASK_DOUBT)}
        className="bg-green-500 hover:bg-green-600 text-white font-black text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shrink-0 transition-all active:scale-95 shadow-md shadow-green-500/30"
      >
        Ask Now
      </button>
    </div>
  );
}
