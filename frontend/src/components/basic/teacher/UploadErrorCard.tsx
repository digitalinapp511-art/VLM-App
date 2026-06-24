import React from "react";
import { RefreshCw, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FileStatusPreview from "./FileStatusPreview";

interface UploadErrorCardProps {
  onRetry: () => void;
  onSupport: () => void;
}

const UploadErrorCard: React.FC<UploadErrorCardProps> = ({ onRetry, onSupport }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "w-full max-w-xl mx-auto p-8 rounded-[48px] border border-red-500/30",
        "bg-zinc-900/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden",
        "shadow-[0_0_50px_rgba(239,68,68,0.1)]"
      )}
    >
      {/* Red Glow Backdrop */}
      <div className="absolute inset-0 bg-red-600/5 blur-[100px] pointer-events-none" />

      <FileStatusPreview fileName="Course_Module_1.mp4" fileSize="(250 MB)" />

      <div className="text-center space-y-6 mt-4">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
          Upload Failed
        </h2>

        <p className="text-zinc-400 text-sm leading-relaxed px-2 font-medium">
          An issue occurred during the upload of 'Course_Module_1.mp4'. Connection to the server was interrupted. Please check your network and try again.
        </p>

        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.15em]">
          Error Code: NET_FAIL_101
        </p>

        <div className="pt-6 space-y-8">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onRetry}
              className={cn(
                "w-full h-16 rounded-[2rem] text-lg font-black uppercase tracking-widest gap-3",
                "bg-zinc-950/60 border border-red-500/50 text-white transition-all",
                "shadow-[0_0_25px_rgba(239,68,68,0.2)] hover:bg-red-500/10"
              )}
            >
              <RefreshCw size={24} />
              Retry Upload
            </Button>
          </motion.div>

          <button 
            onClick={onSupport}
            className="flex items-center justify-center gap-2 mx-auto text-zinc-400 hover:text-white transition-colors"
          >
            <MessageCircle size={20} className="text-zinc-500" />
            <span className="text-sm font-bold border-b border-zinc-700">Contact Support</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadErrorCard;