import React from "react";
import { motion } from "framer-motion";

const EmptyStateCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full p-8 rounded-[40px] border border-cyan-400/40 bg-zinc-950/40 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.1)] overflow-hidden"
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 m-4 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 m-4 rounded-tr-lg" />

      <div className="flex flex-col items-center text-center gap-8 py-4">
        <h2 className="text-xl font-black text-cyan-400 uppercase tracking-[0.15em] drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
          No Requests Available
        </h2>

        {/* Large Placeholder Image */}
        <div className="w-full aspect-video rounded-3xl bg-zinc-800/80 border border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        </div>

        <p className="text-[15px] font-medium text-zinc-400 leading-relaxed px-2">
          Relax! No students are requesting assistance right now. New requests will appear here as soon as they are available.
        </p>
      </div>
    </motion.div>
  );
};

export default EmptyStateCard;