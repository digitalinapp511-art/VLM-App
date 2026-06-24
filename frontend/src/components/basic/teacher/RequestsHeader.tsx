import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const RequestsHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-6 px-2">
      <div className="flex-1" />
      <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">
        Requests
      </h1>
      <div className="flex-1 flex justify-end">
        <div className="w-11 h-11 rounded-full border-2 border-cyan-400 bg-zinc-900 shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
      </div>
    </header>
  );
};

interface StatusToggleProps {
  isOnline: boolean;
  onToggle: () => void;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({ isOnline, onToggle }) => {
  return (
    <div className="w-full p-1.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-between backdrop-blur-md">
      <div className="flex items-center gap-3 pl-4">
        <div className={cn(
          "w-3 h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
          isOnline ? "bg-emerald-500 scale-110" : "bg-zinc-700 scale-100 shadow-none"
        )} />
        <span className={cn(
          "text-sm font-black uppercase tracking-widest transition-colors",
          isOnline ? "text-emerald-500" : "text-zinc-600"
        )}>
          Online
        </span>
      </div>

      <div className="flex items-center gap-4 pr-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Offline</span>
        <button
          onClick={onToggle}
          className="relative w-14 h-7 rounded-full bg-zinc-800 border border-white/10 p-1 transition-colors"
        >
          <motion.div
            animate={{ x: isOnline ? 0 : 28 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
          />
        </button>
      </div>
    </div>
  );
};