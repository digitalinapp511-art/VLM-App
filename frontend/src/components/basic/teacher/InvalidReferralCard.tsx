import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, FileText, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReferralReasonBox from "./ReferralReasonBox";
import { cn } from "@/lib/utils";

interface InvalidReferralCardProps {
  userName: string;
  onViewRules: () => void;
  onContactSupport: () => void;
}

const InvalidReferralCard: React.FC<InvalidReferralCardProps> = ({
  userName,
  onViewRules,
  onContactSupport,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "w-full p-8 rounded-[40px] border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl relative overflow-hidden shadow-2xl",
        "before:absolute before:inset-0 before:rounded-[40px] before:p-[1px] before:bg-gradient-to-b before:from-amber-500/20 before:to-transparent before:-z-10"
      )}
    >
      {/* Central Glowing Icon */}
      <div className="flex justify-center mb-8 relative">
        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative w-20 h-20 rounded-full border-4 border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-inner">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
            <AlertCircle className="text-zinc-950" size={36} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Invalid Referral Status
        </h2>
        <p className="text-zinc-400 text-base leading-relaxed px-2 font-medium">
          We have reviewed your recent referral request. Unfortunately, the referral for user{" "}
          <span className="text-white font-bold">[{userName}]</span> has been marked as invalid.
        </p>
      </div>

      {/* Reason Component */}
      <div className="mb-10">
        <ReferralReasonBox
          title="Reason: Duplicate Referral or Self-Referral Detected."
          description="To maintain fairness, referrals cannot be made for oneself or for users already introduced to VLM Academy by another teacher."
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={onViewRules}
          className="w-full h-14 rounded-2xl border-zinc-700 bg-zinc-800/30 text-zinc-300 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800/50 hover:text-white transition-all flex gap-3"
        >
          <FileText size={18} />
          View Referral Rules
        </Button>
        
        <Button
          variant="outline"
          onClick={onContactSupport}
          className="w-full h-14 rounded-2xl border-zinc-700 bg-zinc-800/30 text-zinc-300 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800/50 hover:text-white transition-all flex gap-3"
        >
          <Headset size={18} />
          Contact Support
        </Button>
      </div>
    </motion.div>
  );
};

export default InvalidReferralCard;