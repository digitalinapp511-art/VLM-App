import React from "react";
import { Headphones, Paperclip, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Attachment {
  name: string;
}

interface ThreadMessageProps {
  senderType: "TEACHER" | "SUPPORT";
  children: React.ReactNode;
  attachments?: Attachment[];
}

const ThreadMessage: React.FC<ThreadMessageProps> = ({ senderType, children, attachments }) => {
  const isTeacher = senderType === "TEACHER";

  return (
    <div className="flex gap-4 relative">
      {/* Thread Connector Line Logic */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 z-10 shadow-lg",
          isTeacher ? "bg-zinc-800" : "bg-zinc-900 border-zinc-700"
        )}>
          {isTeacher ? (
            <div className="w-8 h-8 rounded-full bg-zinc-700" />
          ) : (
            <Headphones size={20} className="text-zinc-400" />
          )}
        </div>
        <div className="w-[1px] flex-1 bg-zinc-800 my-2" />
      </div>

      <div className="flex-1 pb-10">
        <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-4">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">
            {senderType} REPLY
          </span>
          <div className="text-[13px] text-zinc-300 leading-relaxed font-medium">
            {children}
          </div>
          
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400">
                  <Paperclip size={14} className="-rotate-45" />
                  <FileText size={14} />
                  <span className="text-[10px] font-bold truncate max-w-[120px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadMessage;