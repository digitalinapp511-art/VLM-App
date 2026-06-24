import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const SessionStatusHero: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-[28px] border-2 border-cyan-400 bg-zinc-950/40 backdrop-blur-xl flex items-center gap-5 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
    >
      <div className="w-20 h-20 rounded-full border-2 border-cyan-400 bg-zinc-900 shadow-inner" />
      
      <div className="space-y-1.5">
        <p className="text-zinc-400 text-sm font-medium">
          Student: <span className="text-white font-bold">Aisha Gupta</span> | Grade 10
        </p>
        <p className="text-zinc-400 text-sm font-medium">
          Subject: <span className="text-white font-bold">Physics</span> | #VLM-2934
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-zinc-400 text-sm font-medium uppercase tracking-tighter">Status:</span>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/40 rounded-full px-3 py-0.5 flex gap-1.5 items-center font-black text-[10px] tracking-widest">
            RESOLVED <CheckCircle2 size={12} strokeWidth={3} />
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionStatusHero;