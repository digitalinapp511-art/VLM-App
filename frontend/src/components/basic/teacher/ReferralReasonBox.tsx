import React from "react";
import { AlertTriangle } from "lucide-react";

interface ReferralReasonBoxProps {
  title: string;
  description: string;
}

const ReferralReasonBox: React.FC<ReferralReasonBoxProps> = ({ title, description }) => {
  return (
    <div className="w-full p-5 rounded-3xl bg-amber-950/20 border border-amber-500/10 flex flex-col gap-3 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl -z-10" />
      
      <div className="flex items-start justify-between">
        <h3 className="text-zinc-100 font-bold text-[15px] leading-tight flex-1 pr-4">
          {title}
        </h3>
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
      </div>
      
      <p className="text-zinc-400 text-sm leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
};

export default ReferralReasonBox;