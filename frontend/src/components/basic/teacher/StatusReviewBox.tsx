import React from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface StatusReviewBoxProps {
  caseId: string;
  targetDate: string;
}

const StatusReviewBox: React.FC<StatusReviewBoxProps> = ({ caseId, targetDate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-4"
    >
      <div className="flex items-center justify-center gap-2">
        <Clock size={20} className="text-zinc-100" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          STATUS: REVIEW PENDING
        </h3>
      </div>

      <p className="text-[13px] text-zinc-400 font-medium leading-relaxed text-center px-2">
        Your case is currently undergoing a detailed review by our Trust & Safety team. 
        We aim to complete reviews within 7-10 business days.
      </p>

      <div className="pt-2 flex flex-col items-center gap-1 border-t border-white/5">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          Case #{caseId}
        </p>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          Target Resolution: {targetDate}
        </p>
      </div>
    </motion.div>
  );
};

export default StatusReviewBox;