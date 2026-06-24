import React from "react";
import { motion } from "framer-motion";

interface CircularTimerProps {
  seconds: number;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ seconds }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / 30) * circumference; // Assuming 30s total

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* SVG Circle Progress */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-zinc-800 fill-none"
            strokeWidth="8"
          />
          <motion.circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-cyan-400 fill-none"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))" }}
          />
        </svg>

        {/* Seconds Number */}
        <motion.span 
          key={seconds}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black text-cyan-400 tracking-tighter"
          style={{ textShadow: "0 0 20px rgba(34, 211, 238, 0.5)" }}
        >
          {seconds}
        </motion.span>
      </div>
      
      <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-4">
        Seconds Remaining
      </span>
    </div>
  );
};

export default CircularTimer;