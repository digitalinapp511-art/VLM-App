import React from "react";
import {  TrendingDown, TrendingUp } from "lucide-react";
import type {LucideIcon} from "lucide-react"
import { cn } from "@/lib/utils";

interface AnalyticsMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
  variant: "teal" | "yellow" | "purple" | "zinc";
  children?: React.ReactNode;
}

const AnalyticsMetricCard: React.FC<AnalyticsMetricCardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  trendDirection = "up",
  variant,
  children,
}) => {
  const styles = {
    teal: "border-teal-500/40 bg-teal-500/[0.02]",
    yellow: "border-yellow-500/40 bg-yellow-500/[0.02]",
    purple: "border-purple-500/40 bg-purple-500/[0.02]",
    zinc: "border-white/10 bg-white/[0.01]",
  };

  return (
    <div className={cn("p-5 rounded-[28px] border flex flex-col gap-3 h-full", styles[variant])}>
      <div className="w-9 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500">
        <Icon size={18} />
      </div>

      <div className="space-y-0.5">
        <span className="text-2xl font-black text-white tracking-tight leading-none">{value}</span>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight leading-tight pt-1">
          {label}
        </p>
      </div>

      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black uppercase tracking-tight",
          trendDirection === "up" ? "text-emerald-500" : "text-rose-500"
        )}>
          {trendDirection === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
        </div>
      )}

      {children}
    </div>
  );
};

export default AnalyticsMetricCard;