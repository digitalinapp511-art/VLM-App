import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  variant?: "cyan" | "purple" | "blue" | "rose";
  trend?: "up" | "down";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  variant = "cyan",
  trend,
  className,
}) => {
  const colors = {
    cyan: "text-cyan-400 border-l-cyan-500",
    purple: "text-purple-400 border-l-purple-500",
    blue: "text-blue-500 border-l-blue-600",
    rose: "text-rose-500 border-l-rose-600",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "p-5 rounded-3xl bg-zinc-900/50 border border-white/5 border-l-4 backdrop-blur-sm flex flex-col justify-between h-full transition-all",
        colors[variant],
        className
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
          {title}
        </span>
        {trend === "up" && <span className="text-cyan-400 text-xs">↗</span>}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="flex flex-col">
          <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
          {subValue && <span className="text-[10px] font-bold opacity-80 mt-1 uppercase">{subValue}</span>}
        </div>
        {Icon && (
          <div className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400">
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;