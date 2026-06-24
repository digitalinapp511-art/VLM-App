import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const SessionHeader: React.FC = () => {
  return (
    <div className="w-full space-y-4 pt-2">
      {/* Top Timer */}
      <h2 className="text-center text-[#22d3ee] font-black text-sm tracking-widest uppercase">
        Session Remaining: 07:25
      </h2>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-4 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="rounded-full border-[#22d3ee] text-[#22d3ee] bg-[#22d3ee]/5 px-4 py-1 font-bold text-xs"
          >
            Math - Calculus
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="space-y-0.5">
            <h3 className="text-white font-bold text-sm">Aisha Sharma</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">Doubt ID: #VLM-C-456</p>
          </div>
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionHeader;