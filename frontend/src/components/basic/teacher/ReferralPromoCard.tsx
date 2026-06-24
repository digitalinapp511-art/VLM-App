import React from "react";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ReferralPromoCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-[32px] border-2 border-cyan-400/40 bg-zinc-950/40 backdrop-blur-xl relative overflow-hidden",
        "shadow-[0_0_30px_rgba(34,211,238,0.1)]"
      )}
    >
      <div className="flex items-start gap-5">
        <div className="shrink-0 p-3 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner">
          <GraduationCap className="text-yellow-500" size={36} strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white leading-tight">
            Unlock Rewards for Every New Student Signup!
          </h2>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-cyan-400 tracking-tighter">+500 Points</p>
            <p className="text-sm font-bold text-yellow-500/80">₹ 500 INR Equivalent</p>
          </div>
        </div>
      </div>
      <p className="text-[10px] font-bold text-zinc-600 mt-6 italic tracking-tight">
        *Rewards are credited after first paid enrollment.*
      </p>
    </motion.div>
  );
};

export default ReferralPromoCard;