import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LiveControlButtonProps {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "active" | "danger";
  active?: boolean;
  onClick?: () => void;
}

const LiveControlButton: React.FC<LiveControlButtonProps> = ({
  icon,
  label,
  variant = "default",
  active,
  onClick
}) => {
  if ((active as boolean) === true) variant = "active";
  const variants = {
    default: "bg-white/10 border-white/5 text-zinc-400",
    active: "bg-blue-600 border-blue-400/50 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]",
    danger: "bg-rose-500 border-rose-400/50 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300",
          variants[variant]
        )}
      >
        {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: 2 } as any))}
      </motion.button>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        variant === "danger" ? "text-rose-500" : "text-zinc-400"
      )}>
        {label}
      </span>
    </div>
  );
};

export default LiveControlButton;