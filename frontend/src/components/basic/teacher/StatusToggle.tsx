import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusToggleProps {
  isOnline: boolean;
  onToggle: () => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ isOnline, onToggle }) => {
  return (
    <div className="w-full p-1 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-2 pl-4">
        <div className={cn(
          "w-3 h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
          isOnline ? "bg-emerald-500 scale-110" : "bg-zinc-700 scale-100 shadow-none"
        )} />
        <span className={cn(
          "text-xs font-black uppercase tracking-widest transition-colors",
          isOnline ? "text-emerald-500" : "text-zinc-600"
        )}>
          Online
        </span>
      </div>

      <div className="flex items-center gap-3 pr-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Offline</span>
        <button
          onClick={onToggle}
          className="relative w-14 h-7 rounded-full bg-zinc-800 border border-white/10 p-1"
        >
          <motion.div
            animate={{ x: isOnline ? 0 : 28 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
          />
        </button>
      </div>
    </div>
  );
};

export default StatusToggle;