import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type StatusVariant = "online" | "offline" | "busy";

interface StatusOptionCardProps {
  variant: StatusVariant;
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

const StatusOptionCard: React.FC<StatusOptionCardProps> = ({
  variant,
  icon,
  title,
  description,
  isSelected,
  onClick,
}) => {
  const variantStyles = {
    online: isSelected 
      ? "border-[#00FF00] shadow-[0_0_20px_rgba(0,255,0,0.15)] ring-1 ring-[#00FF00]/50" 
      : "border-white/10 opacity-60",
    offline: isSelected 
      ? "border-zinc-400 shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-white/50" 
      : "border-white/10 opacity-60",
    busy: isSelected 
      ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50" 
      : "border-white/10 opacity-60",
  };

  const iconColors = {
    online: "text-[#00FF00]",
    offline: "text-zinc-400",
    busy: "text-white",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full py-5 px-4 rounded-[24px] border bg-[#121212] transition-all duration-300 flex flex-col items-center justify-center gap-2.5 group",
        variantStyles[variant]
      )}
    >
      <h3 className={cn("text-base font-black uppercase tracking-widest leading-none mb-1", isSelected ? "text-white" : "text-zinc-400")}>
        {title}
      </h3>

      <div className={cn("transition-transform duration-300 group-hover:scale-105 shrink-0 flex items-center justify-center h-10", iconColors[variant])}>
        {icon}
      </div>

      <p className={cn("text-[11px] font-medium tracking-tight text-center leading-snug", isSelected ? "text-zinc-400" : "text-zinc-500")}>
        {description}
      </p>
    </motion.button>
  );
};

export default StatusOptionCard;