import React from "react";
import { Paperclip, Image as ImageIcon, Mic, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatInput: React.FC = () => {
  return (
    <div className="flex items-center gap-3 w-full max-w-xl mx-auto py-4">
      <div className="flex-1 h-16 rounded-full bg-[#1e222b] border border-white/10 px-6 flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Type your explanation..." 
          className="flex-1 bg-transparent border-none text-zinc-300 placeholder:text-zinc-600 focus:ring-0 text-[15px]"
        />
        <div className="flex items-center gap-3 text-zinc-500">
          <button className="hover:text-zinc-300 transition-colors"><Paperclip size={20} /></button>
          <button className="hover:text-zinc-300 transition-colors"><ImageIcon size={20} /></button>
          <button className="hover:text-zinc-300 transition-colors"><Mic size={20} /></button>
        </div>
      </div>
      
      <Button 
        className="w-16 h-16 rounded-full bg-[#3b82f6] hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center p-0"
      >
        <SendHorizonal size={24} className="text-white -rotate-45 ml-1" />
      </Button>
    </div>
  );
};

export default ChatInput;