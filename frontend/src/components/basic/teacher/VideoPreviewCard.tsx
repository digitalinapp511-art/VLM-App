import React from "react";
import { Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface VideoPreviewCardProps {
  onFileSelect?: (file: File) => void;
}

const VideoPreviewCard: React.FC<VideoPreviewCardProps> = ({ onFileSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-8 rounded-[40px] border border-white/10 bg-[#1A1A1A]/40 backdrop-blur-xl flex flex-col items-center text-center overflow-hidden"
    >
      {/* Central Content */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-3xl bg-zinc-800/50 flex items-center justify-center text-zinc-500 border border-white/5">
          <Video size={40} strokeWidth={1.5} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-zinc-300 font-bold mb-1">
            <Play size={14} fill="currentColor" />
            <span>Play</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            Video Preview
          </h2>
          <p className="text-zinc-500 text-xs font-bold">
            Current Duration: 0:00
          </p>
        </div>
      </div>

      <p className="text-zinc-400 text-[11px] font-bold mb-8 uppercase tracking-tight">
        Maximum Duration: 180 Seconds (3 Minutes)
      </p>

      {/* Buttons */}
      <div className="flex gap-4 w-full items-center justify-center">
        <Button className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:brightness-110 text-xs font-black uppercase tracking-widest text-white border border-blue-400/20 shadow-lg shadow-blue-900/20">
          Record Now
        </Button>
        <label className="flex-1 h-12 rounded-2xl border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center justify-center cursor-pointer">
          Upload File
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file && onFileSelect) onFileSelect(file);
            }}
          />
        </label>
      </div>
    </motion.div>
  );
};

export default VideoPreviewCard;