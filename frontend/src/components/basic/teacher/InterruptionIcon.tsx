import React from "react";
import { CloudOff, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const InterruptionIcon: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center h-32 w-32 mx-auto mb-8">
      {/* Background glow */}
      <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        {/* Main Disconnected Cloud Icon */}
        <CloudOff size={90} className="text-zinc-400" strokeWidth={1.5} />
        
        {/* Warning Badge */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -bottom-1 -right-1 bg-zinc-950 rounded-lg border border-white/20 p-1.5 shadow-xl"
        >
          <AlertTriangle size={24} className="text-white" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InterruptionIcon;