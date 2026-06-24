import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ReferralStatus = "CREDITED" | "VERIFIED" | "ELIGIBLE" | "REGISTERED" | "CLICKED";

interface ReferralItemCardProps {
  name: string;
  role: string;
  date: string;
  status: ReferralStatus;
  avatar: string;
}

const statusConfig = {
  CREDITED: { label: "REWARD CREDITED", class: "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" },
  VERIFIED: { label: "VERIFIED", class: "border-yellow-500/50 text-yellow-500 bg-yellow-500/5" },
  ELIGIBLE: { label: "ELIGIBLE", class: "border-cyan-500/50 text-cyan-500 bg-cyan-500/5" },
  REGISTERED: { label: "REGISTERED", class: "border-orange-500/50 text-orange-500 bg-orange-500/5" },
  CLICKED: { label: "CLICKED", class: "border-zinc-500/50 text-zinc-500 bg-zinc-500/5" },
};

const ReferralItemCard: React.FC<ReferralItemCardProps> = ({ name, role, date, status, avatar }) => {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex items-center justify-between group hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12 border border-white/10">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-zinc-800 text-white font-bold">{name[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <h4 className="text-[15px] font-bold text-white tracking-tight">{name}</h4>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
            {role} • <span className="lowercase first-letter:uppercase">Join Date: {date}</span>
          </p>
        </div>
      </div>

      <div className={cn(
        "px-4 py-1.5 rounded-full border text-[9px] font-black tracking-widest transition-all",
        config.class
      )}>
        {config.label}
      </div>
    </motion.div>
  );
};

export default ReferralItemCard;