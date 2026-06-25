import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  activeColor?: "blue" | "purple" | "gold" | "zinc" | "green" | "pink" | "orange" | "cyan" | "rose";
  onClick: () => void;
}

const colorMap = {
  blue: {
    border: "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    icon: "text-blue-400",
    badge: "bg-blue-500",
  },
  purple: {
    border: "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    icon: "text-purple-400",
    badge: "bg-purple-500",
  },
  gold: {
    border: "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
    icon: "text-yellow-400",
    badge: "bg-yellow-500",
  },
  zinc: {
    border: "border-zinc-400",
    icon: "text-zinc-100",
    badge: "bg-zinc-400",
  },
  green: {
    border: "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    icon: "text-green-400",
    badge: "bg-green-500",
  },
  pink: {
    border: "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    icon: "text-pink-400",
    badge: "bg-pink-500",
  },
  orange: {
    border: "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
    icon: "text-orange-400",
    badge: "bg-orange-500",
  },
  cyan: {
    border: "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    icon: "text-cyan-400",
    badge: "bg-cyan-500",
  },
  rose: {
    border: "border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]",
    icon: "text-rose-400",
    badge: "bg-rose-500",
  },
};

const SubjectCard: React.FC<SubjectCardProps> = ({
  label,
  icon,
  isSelected,
  activeColor = "zinc",
  onClick,
}) => {
  const theme = colorMap[activeColor];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 p-4 w-full h-full aspect-square rounded-[24px] border transition-all duration-300",
        "bg-[#1A1A1A] backdrop-blur-sm",
        isSelected 
          ? cn("bg-opacity-100", theme.border) 
          : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Selection Badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center z-10",
              theme.badge
            )}
          >
            <Check className="text-black w-3 h-3" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "transition-colors duration-300",
        isSelected ? theme.icon : "text-zinc-400"
      )}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { size: 32, strokeWidth: 1.5 })
          : icon
        }
      </div>

      <span className={cn(
        "text-sm font-medium transition-colors duration-300",
        isSelected ? "text-zinc-100" : "text-zinc-400"
      )}>
        {label}
      </span>
    </motion.button>
  );
};

export default SubjectCard;