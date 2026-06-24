import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sigma } from "lucide-react";
const VideoPlayer: React.FC = () => {
  return (
    <div className="relative w-full aspect-video rounded-[32px] bg-[#0f172a] overflow-hidden group border border-white/5">
      {/* Top Right Math Icon Decorator */}
      <div className="absolute top-6 right-8 opacity-20">
        <div className="border border-dashed border-white/40 p-1 rounded">
          <Sigma size={20} className="text-white" />
        </div>
      </div>

      {/* Central Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-10 py-4 rounded-3xl text-xl font-bold text-white transition-all",
            "bg-gradient-to-br from-[#3b82f6] to-[#1e40af] border border-blue-400/30",
            "shadow-[0_0_40px_rgba(59,130,246,0.4)]"
          )}
        >
          Play
        </motion.button>
      </div>

      {/* Progress Bar & Controls */}
      <div className="absolute bottom-8 left-0 w-full px-8 space-y-3">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-1/3 bg-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <div className="absolute left-[33%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]" />
          </div>
          <span className="text-[11px] font-bold text-zinc-400 tabular-nums uppercase tracking-widest">
            12:45 / 45:00
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;