import React from "react";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReviewSectionCardProps {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
  className?: string;
}

const ReviewSectionCard: React.FC<ReviewSectionCardProps> = ({
  title,
  onEdit,
  children,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-5 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-zinc-100 tracking-tight">
          {title}
        </h3>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 transition-colors"
          >
            <Pencil size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>
      <div className="text-zinc-400 text-xs space-y-1">
        {children}
      </div>
    </motion.div>
  );
};

export default ReviewSectionCard;