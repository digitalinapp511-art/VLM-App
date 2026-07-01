import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassSelectionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const ClassSelectionCard: React.FC<ClassSelectionCardProps> = ({
  title,
  subtitle,
  icon,
  isSelected,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-between h-[240px] w-full p-6 rounded-[32px] border transition-all duration-300",
        "bg-[#1A1A1A]/80 backdrop-blur-md",
        isSelected 
          ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]" 
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
            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center z-10 shadow-lg"
          >
            <Check className="text-black w-4 h-4" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-1">
        <h3 className="text-lg font-bold text-white tracking-tight">
          {title}
        </h3>
      </div>

      {/* Icon Area */}
      <div className={cn(
        "transition-transform duration-300",
        isSelected ? "scale-110" : "opacity-80"
      )}>
        {icon}
      </div>

      <div className="text-center">
        <p className={cn(
          "text-sm leading-tight transition-colors duration-300",
          isSelected ? "text-zinc-300" : "text-zinc-500"
        )}>
          {subtitle}
        </p>
      </div>
    </motion.button>
  );
};

export default ClassSelectionCard;