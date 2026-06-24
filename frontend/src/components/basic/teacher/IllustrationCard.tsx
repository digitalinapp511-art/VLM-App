import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const IllustrationCard: React.FC = () => {
  return (
    <div className="relative w-full flex justify-center py-4">
      {/* Scaled down container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-44 h-28 rounded-xl border-[3px] border-zinc-500/50 bg-[#121a2b]/80 relative overflow-hidden flex items-center justify-center shadow-2xl"
      >
        <div className="absolute top-1.5 left-1.5 w-6 h-3 bg-white/10 rounded flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
        </div>
        
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
            <div className="w-8 h-3 bg-white/10 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            </div>
            <div className="w-8 h-3 bg-white/10 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            </div>
        </div>

        <div className="w-10 h-10 bg-yellow-600/90 rounded-full shadow-lg" />
        <div className="absolute -bottom-4 w-20 h-12 bg-indigo-500/40 rounded-full blur-md" />

        <div className="absolute bottom-4 left-[-8px] w-12 h-4 bg-yellow-600/70 rounded-full flex items-center px-1 border border-white/20">
             <div className="w-2.5 h-2.5 bg-white rounded-full" />
        </div>

        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="text-white w-3 h-3" strokeWidth={4} />
        </div>
      </motion.div>
      <div className="absolute inset-0 bg-blue-400/5 blur-[60px] -z-10 rounded-full" />
    </div>
  );
};

export default IllustrationCard;