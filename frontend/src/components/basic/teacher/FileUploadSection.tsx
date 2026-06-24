import React from "react";
import { Paperclip, Image as ImageIcon, FileText } from "lucide-react";
import { motion } from "framer-motion";

const FileUploadSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-zinc-400 ml-2">
        Attach documents or screenshots (optional)
      </h3>
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="w-full p-6 rounded-[32px] border-2 border-dashed border-white/5 bg-zinc-900/40 flex items-center justify-between group hover:bg-zinc-900/60 transition-all"
      >
        <Paperclip size={28} className="text-cyan-400 -rotate-45" />
        
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-center gap-2 text-zinc-100">
            <ImageIcon size={20} className="text-cyan-400" />
            <span className="text-[15px] font-black uppercase tracking-widest">ADD FILES (Max 3)</span>
          </div>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
            Supported: PDF, JPG, PNG (Max 5MB/file)
          </p>
        </div>

        <FileText size={28} className="text-zinc-800" />
      </motion.button>
    </div>
  );
};

export default FileUploadSection;