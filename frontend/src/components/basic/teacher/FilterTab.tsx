import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FilterTabProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const FilterTab: React.FC<FilterTabProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 min-w-[85px] h-24 rounded-2xl border transition-all duration-300 relative",
        active 
          ? "bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
          : "bg-zinc-900/40 border-white/10 text-zinc-500 hover:border-zinc-700"
      )}
    >
      <Icon size={24} className={cn(active ? "text-cyan-400" : "text-zinc-400")} />
      <span className={cn("text-[10px] font-bold uppercase tracking-tight", active ? "text-white" : "text-zinc-500")}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="active-filter-glow"
          className="absolute inset-0 rounded-2xl bg-cyan-400/5 blur-sm -z-10"
        />
      )}
    </button>
  );
};

export default FilterTab;