import React from "react";
import { Rocket, Calendar, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const RequestActions: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button className="w-full h-16 rounded-[22px] border border-emerald-500/40 bg-emerald-500/10 text-white font-black uppercase tracking-widest gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20">
          <Rocket size={20} className="text-emerald-400" />
          Stay Online
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button variant="outline" className="w-full h-16 rounded-[22px] border-white/10 bg-zinc-900/40 text-zinc-300 font-black uppercase tracking-widest gap-3 hover:bg-zinc-800">
          <Calendar size={20} className="text-zinc-500" />
          View Schedule
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button variant="outline" className="w-full h-16 rounded-[22px] border-white/10 bg-zinc-900/40 text-zinc-300 font-black uppercase tracking-widest gap-3 hover:bg-zinc-800">
          <Landmark size={20} className="text-zinc-500" />
          Check Earnings
        </Button>
      </motion.div>
    </div>
  );
};