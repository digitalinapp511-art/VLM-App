import React from "react";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ConfirmationStatus: React.FC = () => {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 12 }}
      className="flex flex-col items-center gap-4 py-8"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
        <ShieldCheck size={80} className="text-blue-500 relative z-10" strokeWidth={1.5} />
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-4 border-zinc-950">
           <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
           </div>
        </div>
      </div>
      <h2 className="text-xl font-black text-emerald-500 uppercase tracking-[0.2em]">
        Scheduled
      </h2>
    </motion.div>
  );
};

export default ConfirmationStatus;