import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CountdownItemProps {
  value: string;
  label: string;
  variant?: "cyan" | "rose";
}

const CountdownItem: React.FC<CountdownItemProps> = ({ value, label, variant = "cyan" }) => {
  const colors = {
    cyan: "border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]",
    rose: "border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-sm",
          colors[variant]
        )}
      >
        <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none">
          {value}
        </span>
        <span className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
          {label}
        </span>
      </motion.div>
    </div>
  );
};

export default CountdownItem;