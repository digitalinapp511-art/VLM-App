import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingSpinWheelProps {
  lastSpinDate?: string | null;
  activeSecondsSinceLastSpin?: number;
  onLockedClick?: () => void;
}

export default function FloatingSpinWheel({ lastSpinDate, activeSecondsSinceLastSpin = 0, onLockedClick }: FloatingSpinWheelProps) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const cached = sessionStorage.getItem("vlm_spin_seconds_left");
    return cached ? parseInt(cached) : 7200;
  });

  useEffect(() => {
    if (activeSecondsSinceLastSpin === 0) {
      sessionStorage.removeItem("vlm_spin_seconds_left");
      setSecondsLeft(0);
      return;
    }
    const cached = sessionStorage.getItem("vlm_spin_seconds_left");
    if (!cached) {
      const remSeconds = Math.max(0, 7200 - activeSecondsSinceLastSpin);
      setSecondsLeft(remSeconds);
      sessionStorage.setItem("vlm_spin_seconds_left", remSeconds.toString());
    }
  }, [activeSecondsSinceLastSpin]);

  useEffect(() => {
    if (secondsLeft > 0) {
      sessionStorage.setItem("vlm_spin_seconds_left", secondsLeft.toString());
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          const val = Math.max(0, prev - 1);
          sessionStorage.setItem("vlm_spin_seconds_left", val.toString());
          return val;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      sessionStorage.removeItem("vlm_spin_seconds_left");
    }
  }, [secondsLeft]);

  const canSpin = secondsLeft <= 0;

  const formatTime = () => {
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (!canSpin) {
      onLockedClick?.();
      return;
    }
    navigate(PATHS.SPINNER);
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-24 right-5 z-[50]"
    >
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`relative flex flex-col items-center justify-center p-2 rounded-2xl shadow-2xl transition-all duration-300 border backdrop-blur-md cursor-pointer ${canSpin
          ? "w-16 h-16 bg-gradient-to-tr from-[#6d28d9] via-[#7c3aed] to-[#a855f7] border-white/30 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]"
          : "w-16 h-16 bg-[#161233]/90 border-white/10 text-white/50 shadow-black/40"
          }`}
      >
        {/* Spinning wheel container */}
        <div className="text-2xl select-none">
          🎡
        </div>

        {/* Small Timer or Spin Text */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-center whitespace-nowrap z-10">
          {canSpin ? (
            <span className="bg-[#10b981] text-white px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse">
              SPIN!
            </span>
          ) : (
            <span className="bg-black/60 text-white/90 px-1 py-0.5 rounded-full font-mono">
              {formatTime()}
            </span>
          )}
        </div>

        {/* Active notification indicator */}
        {canSpin && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}
