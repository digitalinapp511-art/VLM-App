import React from "react";
import { User, Lock, Ban } from "lucide-react";
import { motion } from "framer-motion";

const BlockedIllustration: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center h-32 w-32 mx-auto mb-8">
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full" />
      
      <div className="relative">
        {/* Main User Icon */}
        <User size={80} className="text-zinc-200" strokeWidth={1.5} />
        
        {/* Top Right Lock Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-2 bg-zinc-100 p-1.5 rounded-lg shadow-lg"
        >
          <Lock size={20} className="text-zinc-900" fill="currentColor" />
        </motion.div>

        {/* Bottom Right Ban Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-2 -right-4 bg-zinc-900 rounded-full"
        >
          <Ban size={36} className="text-red-500 fill-red-500/10" strokeWidth={2.5} />
        </motion.div>
      </div>
    </div>
  );
};

export default BlockedIllustration;