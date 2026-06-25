import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardSelectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const BoardSelectionCard: React.FC<BoardSelectionCardProps> = ({
  title,
  description,
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
        "relative flex flex-row md:flex-col items-center justify-start md:justify-center gap-4 md:gap-8 p-6 md:p-8 w-full rounded-[24px] md:rounded-[36px] border transition-all duration-500",
        "bg-gradient-to-b from-[#1A1A1A] to-[#121212] backdrop-blur-md md:aspect-[3/4] text-left md:text-center",
        isSelected 
          ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]" 
          : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Selection Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/2 -translate-y-1/2 md:translate-y-0 md:top-6 right-6 w-6 h-6 md:w-7 md:h-7 rounded-full bg-yellow-500 flex items-center justify-center z-10 shadow-lg shadow-yellow-500/20"
          >
            <Check className="text-black w-3 h-3 md:w-4 md:h-4" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Icon */}
      <div className={cn(
        "p-3 md:p-6 rounded-full transition-all duration-500 shrink-0",
        isSelected ? "text-yellow-500 md:scale-110" : "text-zinc-500 opacity-60"
      )}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-10 h-10 md:w-16 md:h-16", strokeWidth: 1.5 })
          : icon
        }
      </div>

      {/* Text Content */}
      <div className="space-y-1 md:space-y-3 flex-1 pr-8 md:pr-0">
        <h3 className={cn(
          "text-xl md:text-2xl font-bold tracking-tighter transition-colors duration-300",
          isSelected ? "text-white" : "text-zinc-400"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-xs md:text-sm font-medium leading-relaxed md:px-4 transition-colors duration-300",
          isSelected ? "text-zinc-400" : "text-zinc-600"
        )}>
          {description}
        </p>
      </div>
    </motion.button>
  );
};

export default BoardSelectionCard;