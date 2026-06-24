import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageCardProps {
  label: string;
  nativeLabel?: string;
  glyph: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  label,
  nativeLabel,
  glyph,
  isSelected,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center aspect-square rounded-[28px] border transition-all duration-500 overflow-hidden",
        isSelected 
          ? "border-cyan-400/50 bg-gradient-to-br from-[#4ade80] via-[#3b82f6] to-[#a855f7] shadow-[0_0_25px_rgba(59,130,246,0.3)]" 
          : "border-white/10 bg-[#1A1A1A]/80 hover:border-white/20"
      )}
    >
      {/* Selection Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center z-10 shadow-lg"
          >
            <Check className="text-black w-3.5 h-3.5" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glyph/Icon Section */}
      <div className={cn(
        "text-4xl font-bold mb-2 transition-all duration-300",
        isSelected ? "text-white scale-110" : "text-zinc-400"
      )}>
        {glyph}
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center gap-0.5">
        <span className={cn(
          "text-[15px] font-bold transition-colors duration-300",
          isSelected ? "text-white" : "text-zinc-300"
        )}>
          {label}
        </span>
        {nativeLabel && (
          <span className={cn(
            "text-[11px] font-medium transition-colors duration-300",
            isSelected ? "text-white/80" : "text-zinc-500"
          )}>
            {nativeLabel}
          </span>
        )}
      </div>
    </motion.button>
  );
};

export default LanguageCard;