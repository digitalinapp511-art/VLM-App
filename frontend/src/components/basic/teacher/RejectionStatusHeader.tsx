import React from "react";
import { ShieldAlert, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const RejectionStatusHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="relative"
      >
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
        
        {/* Main Shield Icon */}
        <div className="relative z-10 p-6 rounded-[2rem] border-2 border-red-500/50 bg-zinc-950/50 backdrop-blur-sm">
          <ShieldAlert size={80} className="text-red-500" strokeWidth={1.5} />
          
          {/* X Badge */}
          <div className="absolute bottom-4 right-4 bg-zinc-950 rounded-full p-1">
            <XCircle size={32} className="text-red-500 fill-zinc-950" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RejectionStatusHeader;