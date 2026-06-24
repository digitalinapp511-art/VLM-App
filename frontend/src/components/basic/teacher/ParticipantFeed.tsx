import React from "react";
import { motion } from "framer-motion";

interface ParticipantFeedProps {
  name: string;
}

const ParticipantFeed: React.FC<ParticipantFeedProps> = ({ name }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-32 h-44 rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-md overflow-hidden relative shadow-2xl"
    >
      {/* Participant Video Placeholder / UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      
      {/* Label */}
      <div className="absolute bottom-2 left-0 w-full text-center">
        <span className="text-[10px] font-bold text-zinc-300 tracking-tight">
          {name}
        </span>
      </div>
    </motion.div>
  );
};

export default ParticipantFeed;