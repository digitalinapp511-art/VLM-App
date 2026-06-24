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
        "relative flex flex-col items-center justify-center gap-8 p-8 aspect-[3/4] rounded-[36px] border transition-all duration-500",
        "bg-gradient-to-b from-[#1A1A1A] to-[#121212] backdrop-blur-md",
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
            className="absolute top-6 right-6 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center z-10 shadow-lg shadow-yellow-500/20"
          >
            <Check className="text-black w-4 h-4" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Icon */}
      <div className={cn(
        "p-6 rounded-full transition-all duration-500",
        isSelected ? "text-yellow-500 scale-110" : "text-zinc-500 opacity-60"
      )}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { size: 64, strokeWidth: 1 })
          : icon
        }
      </div>

      {/* Text Content */}
      <div className="text-center space-y-3">
        <h3 className={cn(
          "text-2xl font-bold tracking-tighter transition-colors duration-300",
          isSelected ? "text-white" : "text-zinc-400"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm font-medium leading-relaxed px-4 transition-colors duration-300",
          isSelected ? "text-zinc-400" : "text-zinc-600"
        )}>
          {description}
        </p>
      </div>
    </motion.button>
  );
};

export default BoardSelectionCard;