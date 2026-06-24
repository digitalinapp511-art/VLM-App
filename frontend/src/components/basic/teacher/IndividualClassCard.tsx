import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndividualClassCardProps {
  id: number;
  title: string;
  category?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const IndividualClassCard: React.FC<IndividualClassCardProps> = ({
  title,
  category,
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
        "relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 w-full h-[84px]",
        "bg-[#1A1A1A]/90 backdrop-blur-sm text-left",
        isSelected 
          ? "border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.15)] bg-yellow-500/[0.03]" 
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
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center z-10 shadow-lg"
          >
            <Check className="text-black w-3 h-3" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon Area */}
      <div className={cn(
        "flex-shrink-0 transition-colors duration-300",
        isSelected ? "text-yellow-500" : "text-zinc-400"
      )}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { size: 28, strokeWidth: 1.5 })
          : icon
        }
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <span className={cn(
          "text-[15px] font-bold tracking-tight transition-colors duration-300",
          isSelected ? "text-white" : "text-zinc-200"
        )}>
          {title}
        </span>
        {category && (
          <span className="text-[11px] text-zinc-500 font-medium">
            {category}
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default IndividualClassCard;