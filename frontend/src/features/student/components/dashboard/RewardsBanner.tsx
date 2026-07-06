/**
 * RewardsBanner.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The purple "Complete goals, earn points and win exciting rewards!" banner
 * with a "View Rewards" button navigating to the spin wheel.
 */
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Trophy } from "lucide-react";

export default function RewardsBanner() {
  const navigate = useNavigate();

  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #4f1eb8 0%, #7c3aed 60%, #a855f7 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-yellow-400/20 blur-xl" />
      <div className="absolute -top-4 right-16 w-16 h-16 rounded-full bg-pink-400/20 blur-lg" />

      <div className="relative z-10 flex items-center p-4 gap-4">
        {/* Trophy emoji */}
        <div className="text-4xl shrink-0">🏆</div>

        {/* Text */}
        <div className="flex-1">
          <p className="text-white font-black text-sm leading-tight">
            Complete goals, earn points
          </p>
          <p className="text-white/70 text-xs mt-0.5">
            and win exciting rewards!
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(PATHS.SPINNER)}
          className="bg-white/20 hover:bg-white/30 text-white font-black text-[10px] px-3 py-2 rounded-xl border border-white/30 transition-all active:scale-95 shrink-0 whitespace-nowrap"
        >
          View Rewards
        </button>
      </div>
    </div>
  );
}
