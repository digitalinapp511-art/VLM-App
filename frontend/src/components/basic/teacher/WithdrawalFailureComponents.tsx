import React from "react";
import { motion } from "framer-motion";
import { Banknote } from "lucide-react";
// 1. Failure Illustration with Slashed Banknote effect
export const FailureIllustration: React.FC = () => (
  <div className="relative flex justify-center items-center py-10">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* Red Glow Background */}
      <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
      
      <div className="relative z-10">
         {/* Custom composition to match the "slashed banknote" icon */}
         <div className="relative">
            <Banknote size={80} className="text-red-500 opacity-60" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-10 h-10 rounded-full bg-red-900/80 border border-red-500/50 flex items-center justify-center shadow-lg">
                  <span className="text-red-200 font-bold text-lg">₹</span>
               </div>
            </div>
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: "120%" }}
               className="absolute top-1/2 left-[-10%] h-[4px] bg-red-500 rounded-full -rotate-[35deg] shadow-[0_0_10px_red]"
            />
         </div>
      </div>
    </motion.div>
  </div>
);

// 2. Status Card with Red Border
export const FailedStatusCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-[32px] border border-red-500/40 bg-zinc-950/40 backdrop-blur-xl space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.05)]"
  >
    <h3 className="text-lg font-black text-rose-300 text-center uppercase tracking-tight">
      Failed Transfer Status
    </h3>
    <div className="space-y-3">
      <p className="text-[13px] text-zinc-300 leading-relaxed">
        <span className="font-bold text-white">Reason for Failure:</span> An error occurred with your IMPS transfer due to bank processing. Please retry or contact support for assistance.
      </p>
      <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
        Error Code: WTR_FAIL_101
      </p>
    </div>
  </motion.div>
);

// 3. Transaction Summary with Purple Border
export const TransactionSummaryCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="p-6 rounded-[32px] border border-purple-500/40 bg-zinc-950/40 backdrop-blur-xl space-y-5"
  >
    <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em] ml-1">
      Transaction Summary
    </h3>
    
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-medium text-zinc-400">Original Amount Requested:</span>
        <span className="text-[15px] font-black text-cyan-400">₹ 2,50,000 INR</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-medium text-zinc-400">VLM Points Equivalent:</span>
        <span className="text-[13px] font-bold text-zinc-200">~ 25,000 Points</span>
      </div>
    </div>

    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
      <div className="w-10 h-10 bg-[#ed1c24] rounded-lg flex items-center justify-center shrink-0">
        <span className="text-xl font-black text-white">H</span>
      </div>
      <div className="flex flex-col">
        <h4 className="text-sm font-bold text-white leading-none">HDFC Bank</h4>
        <p className="text-[11px] font-medium text-zinc-500 mt-1 uppercase">Account No.: **** 3633</p>
      </div>
    </div>
  </motion.div>
);