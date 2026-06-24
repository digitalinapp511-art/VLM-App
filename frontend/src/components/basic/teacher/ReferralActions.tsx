import React from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const LinkShareInput: React.FC<{ link: string }> = ({ link }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Unique Invite Link</span>
        <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:opacity-80 transition-opacity">
          Share Link
        </button>
      </div>
      <div className="flex items-center gap-3 h-16 px-5 rounded-[22px] border border-white/10 bg-zinc-900/40">
        <span className="flex-1 text-sm font-medium text-zinc-400 truncate">{link}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className="rounded-xl border-cyan-400/50 bg-transparent text-cyan-400 text-[11px] font-black uppercase tracking-widest h-9 px-4"
        >
          Copy Link
        </Button>
      </div>
    </div>
  );
};

export const ReferralCodeBox: React.FC<{ code: string }> = ({ code }) => {
  return (
    <div className="space-y-4 text-center">
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Referral Code</span>
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="w-full h-20 rounded-[28px] border border-white/5 bg-zinc-900/40 flex items-center justify-center gap-4 group"
      >
        <span className="text-2xl font-black text-white tracking-widest">{code}</span>
        <Copy size={20} className="text-zinc-600 group-hover:text-cyan-400 transition-colors" />
      </motion.button>
      <button className="text-[13px] font-bold text-cyan-400/80 hover:text-cyan-400 underline underline-offset-4 tracking-wide transition-all">
        Share Code
      </button>
    </div>
  );
};