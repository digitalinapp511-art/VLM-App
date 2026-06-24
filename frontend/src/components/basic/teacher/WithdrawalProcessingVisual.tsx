import React from "react";
import { motion } from "framer-motion";
import { Banknote } from "lucide-react";

const WithdrawalProcessingVisual: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-6">
      {/* Top Status Pill */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.1)]"
      >
        <span className="text-xs font-black text-cyan-50 transition-all uppercase tracking-widest">
          Processing Your Request
        </span>
      </motion.div>

      {/* Central Animation */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Animated Concentric Rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.1, 0.4, 0.1], 
              scale: [0.8, 1.3, 0.8],
              rotate: i % 2 === 0 ? 360 : -360 
            }}
            transition={{ 
              duration: 4 + i, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute border border-dashed border-cyan-500/40 rounded-full"
            style={{ width: `${i * 33}%`, height: `${i * 33}%` }}
          />
        ))}

        {/* Central Icon Glow */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 w-24 h-24 rounded-full bg-zinc-950 border-2 border-cyan-400/60 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.3)]"
        >
          <div className="absolute inset-0 bg-cyan-400/10 blur-xl rounded-full" />
          <Banknote size={40} className="text-cyan-400 relative z-20" strokeWidth={1.5} />
        </motion.div>
      </div>

      <p className="text-[15px] font-medium text-zinc-500">
        Estimated completion: <span className="text-zinc-100 font-black">Moments</span>
      </p>
    </div>
  );
};

export default WithdrawalProcessingVisual;