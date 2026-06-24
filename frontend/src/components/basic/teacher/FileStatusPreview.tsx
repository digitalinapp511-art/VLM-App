import React from "react";
import { Play, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FileStatusPreviewProps {
  fileName: string;
  fileSize: string;
}

const FileStatusPreview: React.FC<FileStatusPreviewProps> = ({ fileName, fileSize }) => {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative">
        {/* Mock Video Thumbnail */}
        <div className="w-40 h-28 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">mp4</span>
          </div>
          <Play size={32} className="text-white fill-white opacity-80" />
          
          {/* Progress bar mock */}
          <div className="absolute bottom-3 left-3 right-3 h-1 bg-zinc-700 rounded-full">
            <div className="w-1/2 h-full bg-zinc-500 rounded-full" />
          </div>
        </div>

        {/* Error Badge */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="absolute -bottom-2 -right-2 bg-zinc-950 rounded-full p-0.5"
        >
          <XCircle size={32} className="text-red-500 fill-zinc-950" />
        </motion.div>
      </div>

      <div className="text-center">
        <h3 className="text-zinc-100 font-bold text-sm tracking-tight">{fileName}</h3>
        <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest">{fileSize}</p>
      </div>
    </div>
  );
};

export default FileStatusPreview;