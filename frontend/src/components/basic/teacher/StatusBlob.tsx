import React from "react";
import { motion } from "framer-motion";

const StatusBlob: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center py-10">
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-40 h-40 bg-[#2ec4b6] rounded-full blur-[40px] opacity-60"
      />
      
      {/* Main Blob */}
      <motion.div
        animate={{
          borderRadius: [
            "40% 60% 70% 30% / 40% 50% 60% 50%",
            "60% 40% 30% 70% / 50% 60% 40% 60%",
            "40% 60% 70% 30% / 40% 50% 60% 50%",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative w-32 h-32 bg-gradient-to-br from-[#2ec4b6] to-[#011627] shadow-xl"
      />
    </div>
  );
};

export default StatusBlob;