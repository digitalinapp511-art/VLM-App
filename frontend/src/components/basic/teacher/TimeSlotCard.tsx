import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TimeSlotCardProps {
  slotNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  variant: "cyan" | "purple" | "blue";
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ slotNumber, startTime, endTime, subject, variant }) => {
  const variantStyles = {
    cyan: "border-cyan-400 bg-cyan-400/[0.03] text-cyan-400",
    purple: "border-purple-500 bg-purple-500/[0.03] text-purple-400",
    blue: "border-blue-500 bg-blue-500/[0.03] text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden",
        variantStyles[variant]
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-white font-bold text-[15px]">
          Slot {slotNumber}: {startTime} - {endTime}
        </h4>
        <div className="flex gap-3 text-zinc-400">
          <button className="hover:text-white transition-colors">
            <Pencil size={18} strokeWidth={2.5} />
          </button>
          <button className="hover:text-red-400 transition-colors">
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className={cn("px-4 py-1.5 rounded-xl bg-black/40 border border-white/5 flex gap-2 text-sm")}>
          <span className="text-zinc-500">Subject:</span>
          <span className="font-bold underline decoration-2">{subject}</span>
        </div>
        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Available</span>
      </div>
    </motion.div>
  );
};

export default TimeSlotCard;