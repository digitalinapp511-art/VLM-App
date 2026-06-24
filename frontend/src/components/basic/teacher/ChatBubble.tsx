import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Play, Check } from "lucide-react";

interface ChatBubbleProps {
  variant: "student" | "teacher";
  senderName: string;
  children: React.ReactNode;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ variant, senderName, children }) => {
  const isStudent = variant === "student";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "max-w-[85%] rounded-[24px] border p-4 backdrop-blur-md space-y-2",
        isStudent 
          ? "self-start border-[#facc15]/50 bg-[#facc15]/5 shadow-[0_0_15px_rgba(250,204,21,0.05)]" 
          : "self-end border-[#22d3ee]/50 bg-[#22d3ee]/5 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
      )}
    >
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        isStudent ? "text-[#facc15]" : "text-[#22d3ee]"
      )}>
        {senderName}
      </span>
      <div className="text-zinc-100 text-[15px] leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
};

export const MathAttachment: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="self-start rounded-[24px] border border-[#facc15]/50 p-1.5 bg-[#facc15]/5 max-w-[60%]"
  >
    <div className="bg-white rounded-[18px] p-4 text-zinc-900 space-y-3 relative overflow-hidden">
        <div className="w-10 h-3 bg-zinc-200 rounded-full opacity-50" />
        <div className="space-y-1 font-serif text-lg italic">
            <p>f'(x) = 2x + 4</p>
            <p className="flex items-center gap-2">
                f''(x) = 2 
                <span className="text-rose-500"><Check size={20} strokeWidth={3} /></span>
            </p>
        </div>
        <div className="w-full h-8 bg-zinc-100 rounded-lg" />
    </div>
  </motion.div>
);

export const AudioAttachment: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="self-start rounded-2xl border border-[#facc15]/50 p-4 bg-[#facc15]/5 w-64 space-y-2"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-white">
        <Play size={18} fill="currentColor" />
      </div>
      <div className="flex gap-1 items-end h-6 flex-1">
        {[2, 4, 3, 5, 2, 4, 3, 5, 4, 2, 3, 4, 2].map((h, i) => (
          <div key={i} className="flex-1 bg-zinc-600 rounded-full" style={{ height: `${h * 4}px` }} />
        ))}
      </div>
    </div>
    <p className="text-[10px] text-zinc-500 font-bold ml-12">Audio doubt explanation (0:45)</p>
  </motion.div>
);

export default ChatBubble;