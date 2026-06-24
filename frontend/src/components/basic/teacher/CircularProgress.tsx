import React from "react";
import { motion } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-10">
      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Background SVG Rings */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="104"
            cy="104"
            r={radius}
            className="stroke-zinc-800 fill-none"
            strokeWidth="4"
          />
          <motion.circle
            cx="104"
            cy="104"
            r={radius}
            className="stroke-cyan-400 fill-none"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ 
              strokeDasharray: circumference,
              filter: "drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))"
            }}
          />
        </svg>

        {/* Floating dots decoration */}
        <div className="absolute inset-0">
            <div className="absolute top-[10%] right-[20%] w-2 h-2 bg-white rounded-full opacity-60 blur-[1px]" />
            <div className="absolute bottom-[30%] left-[10%] w-2 h-2 bg-white rounded-full opacity-60 blur-[1px]" />
            <div className="absolute top-1/2 right-0 w-2 h-2 bg-white rounded-full opacity-60 blur-[1px]" />
        </div>

        {/* Center Text */}
        <div className="text-center z-10">
          <span className="text-6xl font-black text-white tracking-tighter">
            {percentage}%
          </span>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">
            Complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;