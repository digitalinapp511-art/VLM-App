import React from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  variant?: "blue" | "gold";
  onClick?: () => void;
}

const SelectionChip: React.FC<ChipProps> = ({ label, icon, active, variant = "blue", onClick }) => {
  const activeStyles = {
    blue: "border-blue-500 bg-blue-500/10 text-zinc-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    gold: "border-yellow-500 bg-yellow-500/10 text-zinc-100 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-3 rounded-full border transition-all text-sm font-medium",
        active 
          ? activeStyles[variant] 
          : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
      )}
    >
      {icon}
      {label}
    </button>
  );
};

export { SelectionChip };