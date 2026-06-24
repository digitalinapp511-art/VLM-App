import React from "react";
import { MessageSquare, Mic, Video, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FilterTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const filters: FilterTab[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "audio", label: "Audio", icon: Mic },
  { id: "video", label: "Video", icon: Video },
  { id: "live", label: "Live Class", icon: Monitor },
];

interface SessionFiltersProps {
  activeTab: string;
  onChange: (id: string) => void;
}

const SessionFilters: React.FC<SessionFiltersProps> = ({ activeTab, onChange }) => {
  return (
    <div className="flex items-center justify-between gap-3 py-6 overflow-x-auto no-scrollbar">
      {filters.map((filter) => {
        const isActive = activeTab === filter.id;
        const Icon = filter.icon;
        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 min-w-[76px] h-20 rounded-2xl border transition-all duration-300 relative",
              isActive 
                ? "bg-blue-600/10 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                : "bg-zinc-900/40 border-white/10 text-zinc-500 hover:border-zinc-700"
            )}
          >
            <Icon size={24} className={cn(isActive ? "text-cyan-400" : "text-zinc-400")} />
            <span className={cn("text-[10px] font-bold uppercase tracking-tight", isActive ? "text-white" : "text-zinc-500")}>
              {filter.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="active-glow"
                className="absolute inset-0 rounded-2xl bg-cyan-400/5 blur-sm -z-10"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SessionFilters;