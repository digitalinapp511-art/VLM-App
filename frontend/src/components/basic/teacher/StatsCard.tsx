import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  variant?: "teal" | "gold" | "purple" | "zinc";
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, variant = "zinc", onClick }) => {
  const variants = {
    teal: "border-teal-500/30 bg-teal-500/[0.02] text-teal-400",
    gold: "border-yellow-500/30 bg-yellow-500/[0.02] text-yellow-500",
    purple: "border-purple-500/30 bg-purple-500/[0.02] text-purple-400",
    zinc: "border-white/10 bg-white/[0.02] text-zinc-400",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn("p-4 rounded-2xl border transition-all h-full flex flex-col justify-between", variants[variant], onClick && "cursor-pointer active:scale-95")}
    >
      <span className="text-[11px] font-bold uppercase tracking-tight opacity-80">{title}</span>
      <div className="flex flex-col mt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
          {icon && <div className="opacity-80">{icon}</div>}
        </div>
        {subValue && (
          <span className={cn("text-[10px] font-bold mt-1", variant === "teal" ? "text-emerald-500" : "opacity-40")}>
            {subValue}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;