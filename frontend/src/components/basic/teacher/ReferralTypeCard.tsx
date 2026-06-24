import React from "react";
import { GraduationCap, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ReferralTypeCardProps {
  type: "student" | "teacher";
  bonus: string;
  onClick: () => void;
}

const ReferralTypeCard: React.FC<ReferralTypeCardProps> = ({ type, bonus, onClick }) => {
  const isStudent = type === "student";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "flex-1 p-6 rounded-[32px] border flex flex-col items-center text-center gap-4 transition-all duration-300",
        isStudent 
          ? "border-yellow-500/30 bg-yellow-500/[0.02] shadow-[0_0_30px_rgba(234,179,8,0.05)]" 
          : "border-cyan-500/30 bg-cyan-500/[0.02] shadow-[0_0_30px_rgba(34,211,238,0.05)]"
      )}
    >
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Referral Type</span>
      
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center",
        isStudent ? "text-yellow-500 bg-yellow-500/10" : "text-cyan-400 bg-cyan-400/10"
      )}>
        {isStudent ? <GraduationCap size={28} /> : <UserRound size={28} />}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-white uppercase tracking-tight">
          Refer {isStudent ? "Student" : "Teacher"}
        </h3>
        <p className="text-[10px] font-medium text-zinc-400 leading-tight">
          Unlocks Rewards<br />
          {isStudent ? "Student" : "Teacher"} Bonus: <span className={isStudent ? "text-yellow-500" : "text-cyan-400"}>{bonus}</span>
        </p>
      </div>

      <Button 
        onClick={onClick}
        className={cn(
          "w-full h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
          isStudent 
            ? "bg-gradient-to-br from-yellow-500 to-yellow-700 text-black hover:brightness-110" 
            : "bg-gradient-to-br from-blue-600 to-blue-900 text-white hover:brightness-110"
        )}
      >
        Share Link
      </Button>
    </motion.div>
  );
};

export default ReferralTypeCard;