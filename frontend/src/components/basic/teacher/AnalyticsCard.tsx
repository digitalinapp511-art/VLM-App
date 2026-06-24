import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnalyticsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string | React.ReactNode;
  variant?: "default" | "cyan" | "blue";
  className?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  icon,
  label,
  value,
  subValue,
  variant = "default",
  className,
}) => {
  const variantStyles = {
    default: "border-white/5 bg-white/[0.02]",
    cyan: "border-cyan-400/40 bg-cyan-400/[0.03] shadow-[0_0_20px_rgba(34,211,238,0.1)]",
    blue: "border-blue-500/40 bg-blue-500/[0.03] shadow-[0_0_20px_rgba(59,130,246,0.1)]",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "flex flex-col items-center justify-center p-4 aspect-[4/5] rounded-[24px] border text-center gap-2",
        variantStyles[variant],
        className
      )}
    >
      <div className={cn(
        "mb-1 transition-colors",
        variant === "cyan" ? "text-cyan-400" : variant === "blue" ? "text-blue-400" : "text-zinc-400"
      )}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, ({ size: 28, strokeWidth: 1.5 } as any))
          : icon
        }
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] leading-tight">
          {label}
        </p>
        <h3 className="text-2xl font-black text-white tracking-tighter">
          {value}
        </h3>
      </div>

      {subValue && (
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
          {subValue}
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsCard;