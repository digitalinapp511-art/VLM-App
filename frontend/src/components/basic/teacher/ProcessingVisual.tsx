import React from "react";
import { motion } from "framer-motion";
import { Banknote } from "lucide-react";

const ProcessingVisual: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6">
      <div className="px-5 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 backdrop-blur-sm">
        <span className="text-xs font-black text-white uppercase tracking-widest">Processing Your Request</span>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Decorative Rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
            className="absolute border border-dashed border-cyan-500/40 rounded-full"
            style={{ width: `${i * 33}%`, height: `${i * 33}%` }}
          />
        ))}

        {/* Central Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 w-24 h-24 rounded-full bg-zinc-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)]"
        >
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
          <Banknote size={40} className="text-white relative z-20" strokeWidth={1.5} />
        </motion.div>
      </div>

      <p className="text-[15px] font-medium text-zinc-400">
        Estimated completion: <span className="text-white font-black">Moments</span>
      </p>
    </div>
  );
};

export default ProcessingVisual;