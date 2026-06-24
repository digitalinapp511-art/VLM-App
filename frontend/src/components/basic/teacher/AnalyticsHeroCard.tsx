import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface AnalyticsHeroCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  variant: "cyan" | "blue";
  children?: React.ReactNode;
}

const AnalyticsHeroCard: React.FC<AnalyticsHeroCardProps> = ({
  title,
  value,
  trend,
  icon,
  variant,
  children,
}) => {
  const styles = {
    cyan: "border-cyan-400/40 bg-cyan-400/[0.03] shadow-[0_0_20px_rgba(34,211,238,0.1)]",
    blue: "border-blue-500/40 bg-blue-500/[0.03] shadow-[0_0_20px_rgba(59,130,246,0.1)]",
  };

  return (
    <div className={cn(
      "flex-1 p-5 rounded-[32px] border backdrop-blur-xl flex flex-col gap-4 min-h-[180px]",
      styles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
          {icon}
        </div>
        <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
        <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px]">
          <TrendingUp size={12} />
          <span>{trend}</span>
          <span className="text-zinc-600 font-medium ml-1 uppercase">vs last month</span>
        </div>
      </div>

      {children}
    </div>
  );
};

export default AnalyticsHeroCard;