import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RequestActionButtonProps {
  icon: LucideIcon;
  label: string;
  variant?: "emerald" | "grey";
  onClick?: () => void;
}

const RequestActionButton: React.FC<RequestActionButtonProps> = ({ 
  icon: Icon, 
  label, 
  variant = "grey", 
  onClick 
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full h-16 rounded-[22px] border flex items-center justify-center gap-3 transition-all duration-300",
        variant === "emerald" 
          ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-white" 
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.05]"
      )}
    >
      <Icon size={20} className={variant === "emerald" ? "text-emerald-400" : "text-zinc-500"} />
      <span className="text-sm font-black uppercase tracking-widest">{label}</span>
    </motion.button>
  );
};

export default RequestActionButton;