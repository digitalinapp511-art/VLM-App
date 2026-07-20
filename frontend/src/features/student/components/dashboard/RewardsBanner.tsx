import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";

interface RewardsBannerProps {
  lastSpinDate?: string | null;
  spinCooldownHours?: number;
  onLockedClick?: () => void;
}

export default function RewardsBanner({ lastSpinDate, spinCooldownHours = 2, onLockedClick }: RewardsBannerProps) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (lastSpinDate) {
      const calculateSecondsRemaining = () => {
        const lastSpin = new Date(lastSpinDate).getTime();
        const diffMs = Date.now() - lastSpin;
        const cooldownMs = (spinCooldownHours || 2) * 3600 * 1000;
        const remSeconds = Math.max(0, Math.ceil((cooldownMs - diffMs) / 1000));
        setSecondsLeft(remSeconds);
      };

      calculateSecondsRemaining();
      const interval = setInterval(calculateSecondsRemaining, 1000);
      return () => clearInterval(interval);
    } else {
      setSecondsLeft(0);
    }
  }, [lastSpinDate, spinCooldownHours]);

  const canSpin = secondsLeft <= 0;

  const formatTime = () => {
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleNavigation = () => {
    if (!canSpin) {
      onLockedClick?.();
      return;
    }
    navigate(PATHS.SPINNER);
  };

  return (
    <div
      className="mx-0 w-full rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #4f1eb8 0%, #7c3aed 60%, #a855f7 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-yellow-400/20 blur-xl" />
      <div className="absolute -top-4 right-16 w-16 h-16 rounded-full bg-pink-400/20 blur-lg" />

      <div className="relative z-10 flex items-center p-4 gap-4">
        {/* Spin wheel emoji */}
        <div className="text-4xl shrink-0">🎡</div>

        {/* Text */}
        <div className="flex-1 text-left">
          <p className="text-white font-black text-sm leading-tight">
            {canSpin ? "Spin the Wheel!" : "Wheel Locked"}
          </p>
          <p className="text-white/70 text-[10px] mt-0.5 font-bold uppercase tracking-wider">
            {canSpin ? "Win free coins, points & credits!" : `Next spin in: ${formatTime()} of usage`}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleNavigation}
          className={`font-black text-[10px] px-3 py-2 rounded-xl transition-all active:scale-95 shrink-0 whitespace-nowrap border cursor-pointer ${
            canSpin
              ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
              : "bg-white/10 text-white/50 border-white/10"
          }`}
        >
          {canSpin ? "Spin Now" : "Locked"}
        </button>
      </div>
    </div>
  );
}
