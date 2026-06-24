import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Corner = ({ className }: { className?: string }) => (
  <div className={cn("absolute w-6 h-6 border-cyan-400 m-4", className)} />
);

const NoRequestsCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full p-8 rounded-[44px] border border-cyan-400/40 bg-zinc-950/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)] overflow-hidden"
    >
      {/* Decorative Cyan Corners */}
      <Corner className="top-0 left-0 border-t-2 border-l-2 rounded-tl-lg" />
      <Corner className="top-0 right-0 border-t-2 border-r-2 rounded-tr-lg" />

      <div className="flex flex-col items-center text-center gap-8 py-4">
        <h2 className="text-xl font-black text-cyan-400 uppercase tracking-[0.18em] drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
          No Requests Available
        </h2>

        {/* Illustration Placeholder */}
        <div className="w-full aspect-[4/3] rounded-[32px] bg-zinc-800/80 border border-white/5 relative overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
           <div className="w-20 h-20 bg-zinc-700/30 rounded-full blur-xl animate-pulse" />
        </div>

        <p className="text-[15px] font-medium text-zinc-400 leading-relaxed px-4 md:px-8">
          Relax! No students are requesting assistance right now. New requests will appear here as soon as they are available.
        </p>
      </div>
    </motion.div>
  );
};

export default NoRequestsCard;