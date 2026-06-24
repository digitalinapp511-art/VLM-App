import React from "react";
import { Cloud, Wifi, Ban } from "lucide-react";
import { motion } from "framer-motion";

const ConnectionIllustration: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center h-32 w-40 mx-auto mb-8">
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
      
      <div className="relative">
        {/* Main Cloud Icon */}
        <Cloud size={100} className="text-zinc-100" strokeWidth={1.5} />
        
        {/* Centered Wifi Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3">
          <Wifi size={32} className="text-zinc-100" strokeWidth={2} />
        </div>

        {/* Bottom Right Ban/No-Entry Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute -bottom-1 -right-2 bg-zinc-900 rounded-full p-0.5"
        >
          <Ban size={36} className="text-red-500 fill-red-500/10" strokeWidth={2.5} />
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectionIllustration;