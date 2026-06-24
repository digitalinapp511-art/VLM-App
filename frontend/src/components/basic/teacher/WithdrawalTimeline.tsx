import React from "react";
import { motion } from "framer-motion";
import { Check, Settings, Landmark } from "lucide-react";

const WithdrawalTimeline: React.FC = () => {
  return (
    <div className="py-4 space-y-0">
      {/* Step 1 */}
      <div className="flex gap-4 min-h-[80px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-400/10 flex items-center justify-center text-cyan-400">
            <Check size={20} strokeWidth={3} />
          </div>
          <div className="w-[2px] flex-1 bg-cyan-400" />
        </div>
        <div className="pt-1">
          <h3 className="text-lg font-bold text-white tracking-tight">1. Request Received</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Oct 25, 2024 • 10:10 AM</p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex gap-4 min-h-[80px]">
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-zinc-950 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
          >
            <Settings size={20} strokeWidth={2.5} />
          </motion.div>
          <div className="w-[2px] flex-1 bg-zinc-800" />
        </div>
        <div className="pt-1">
          <h3 className="text-lg font-black text-cyan-400 tracking-tight">2. Processing (Current)</h3>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-600">
            <Landmark size={20} />
          </div>
        </div>
        <div className="pt-1 flex items-center gap-3">
          <h3 className="text-lg font-bold text-zinc-100 tracking-tight">3. Transfer in Progress</h3>
          <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[9px] font-black text-zinc-400 uppercase tracking-widest">upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalTimeline;