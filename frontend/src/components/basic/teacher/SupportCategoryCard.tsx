import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type {LucideIcon} from "lucide-react";
import { cn } from "@/lib/utils";

interface SupportCategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isFullWidth?: boolean;
}

const SupportCategoryCard: React.FC<SupportCategoryCardProps> = ({
  icon: Icon,
  title,
  description,
  isFullWidth = false,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex flex-col p-4 rounded-3xl border transition-all duration-300 text-left group",
        "bg-[#121212]/60 border-white/10 hover:border-cyan-500/40 hover:bg-white/5",
        isFullWidth ? "col-span-full flex-row items-center gap-4 py-6" : "aspect-[1/1.1]"
      )}
    >
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-xl bg-cyan-400/5 border border-cyan-400/20 flex items-center justify-center text-cyan-400 transition-colors group-hover:bg-cyan-400/10",
        isFullWidth && "w-12 h-12"
      )}>
        <Icon size={isFullWidth ? 24 : 20} strokeWidth={1.5} />
      </div>

      <div className={cn("mt-3 flex-1", isFullWidth && "mt-0")}>
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-zinc-100 tracking-tight">{title}</h3>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-cyan-400" />
        </div>
        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1 line-clamp-2">
          {description}
        </p>
      </div>
    </motion.button>
  );
};

export default SupportCategoryCard;