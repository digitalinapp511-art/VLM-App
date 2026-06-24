import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = ["Chat", "Audio", "Video", "Live Class", "Short Video"];

const EarningsFilters: React.FC<FilterTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative px-6 py-2.5 rounded-full border text-[13px] font-bold transition-all duration-300 whitespace-nowrap",
              isActive 
                ? "border-cyan-400 bg-cyan-400/5 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700"
            )}
          >
            {tab}
            {isActive && (
              <motion.div
                layoutId="activeFilterGlow"
                className="absolute inset-0 rounded-full bg-cyan-400/5 blur-sm -z-10"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EarningsFilters;