import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReferralStatsCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  variant: "teal" | "purple" | "gold";
}

const ReferralStatsCard: React.FC<ReferralStatsCardProps> = ({ icon, value, label, variant }) => {
  const styles = {
    teal: "border-teal-500/30 bg-teal-500/[0.02] text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.05)]",
    purple: "border-purple-500/30 bg-purple-500/[0.02] text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.05)]",
    gold: "border-yellow-500/30 bg-yellow-500/[0.02] text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.05)]",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "flex-1 p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all duration-300",
        styles[variant]
      )}
    >
      <div className="opacity-80">
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, ({ size: 24 } as any))
          : icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-black text-white tracking-tighter leading-none">{value}</h3>
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-tight px-1">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

export default ReferralStatsCard;