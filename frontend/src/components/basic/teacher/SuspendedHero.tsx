import React from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { motion } from "framer-motion";

const SuspendedHero: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="relative mb-6"
      >
        {/* Red Glow Backdrop */}
        <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
        
        {/* Main Shield Icon */}
        <div className="relative z-10 p-5 rounded-[2.5rem] border border-red-500/30 bg-zinc-950/40 backdrop-blur-sm">
          <div className="relative">
            <ShieldAlert size={80} className="text-red-500" strokeWidth={1.5} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3">
              <Lock size={24} className="text-red-600 fill-red-600/20" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.h2 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-black text-red-500 uppercase tracking-tight text-center"
      >
        Account Suspended
      </motion.h2>
    </div>
  );
};

export default SuspendedHero;