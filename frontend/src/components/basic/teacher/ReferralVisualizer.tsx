import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const ReferralVisualizer: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      {/* Decorative Sparkles */}
      <motion.div 
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-4 right-10 text-yellow-500/40"
      >
        <Sparkles size={24} />
      </motion.div>
      <motion.div 
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute bottom-10 left-4 text-zinc-600"
      >
        <div className="w-3 h-3 rounded-full bg-current blur-[2px]" />
      </motion.div>

      {/* Main Avatar Circle */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        {/* Animated Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-dashed border-cyan-500/20 rounded-full" 
        />
        <div className="absolute inset-2 border-4 border-blue-600 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.3)]" />
        
        <div className="w-28 h-28 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center relative z-10 overflow-hidden">
           <span className="text-6xl font-black text-white tracking-tighter">R</span>
           {/* Success Badge */}
           <div className="absolute bottom-2 right-2 w-6 h-6 bg-cyan-400 rounded-full border-2 border-zinc-950 flex items-center justify-center shadow-lg">
              <Check size={12} strokeWidth={4} className="text-black" />
           </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Successful<br/>Referral</h3>
        
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex items-center justify-center gap-3"
        >
          <span className="text-4xl font-black text-cyan-400">+</span>
          <h2 className="text-5xl font-black text-cyan-400 tracking-tighter shadow-cyan-500/20 drop-shadow-2xl">10,000</h2>
          <span className="text-4xl font-black text-blue-600 lowercase">pts</span>
        </motion.div>

        <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">Referral Points<br/>Credited!</p>
      </div>
    </div>
  );
};

export default ReferralVisualizer;