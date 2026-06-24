import React from "react";
import { motion } from "framer-motion";
import { Check, Users, Heart, Zap, VolumeX, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipProps {
  id: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  variant: "yellow" | "cyan" | "blue" | "zinc" | "red";
}

const chips: ChipProps[] = [
  { id: "1", label: "[ATTENTIVE]", icon: Zap, active: true, variant: "yellow" },
  { id: "2", label: "[PARTICIPATIVE]", icon: Users, active: true, variant: "cyan" },
  { id: "3", label: "[HELPFUL]", icon: Heart, active: true, variant: "blue" },
  { id: "4", label: "[CHALLENGED]", icon: Zap, variant: "zinc" },
  { id: "5", label: "[QUIET]", icon: VolumeX, variant: "zinc" },
  { id: "6", label: "[UNSTABLE]", icon: AlertCircle, variant: "red" },
];

const EngagementChips: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {chips.map((chip) => (
        <motion.button
          key={chip.id}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative flex items-center justify-center gap-2 h-11 px-2 rounded-xl border transition-all duration-300",
            chip.active ? (
              chip.variant === "yellow" ? "border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]" :
              chip.variant === "cyan" ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]" :
              "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            ) : "border-white/10 bg-white/[0.02] text-zinc-600"
          )}
        >
          {chip.active && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-zinc-950">
              <Check size={10} className="text-zinc-950" strokeWidth={4} />
            </div>
          )}
          <chip.icon size={16} />
          <span className="text-[9px] font-black tracking-tighter">{chip.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default EngagementChips;