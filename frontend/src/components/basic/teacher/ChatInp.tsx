import React from "react";
import { Paperclip, Image as ImageIcon, Camera} from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChatInput: React.FC = () => {
  return (
    <div className="p-4 bg-black sticky bottom-20 z-50">
      <div className="max-w-xl mx-auto flex items-center gap-3 bg-zinc-900/50 border border-white/5 rounded-full p-2 pl-5">
        <div className="flex items-center gap-4 text-zinc-500">
          <button className="hover:text-zinc-300 transition-colors"><Paperclip size={20} /></button>
          <button className="hover:text-zinc-300 transition-colors"><ImageIcon size={20} /></button>
          <button className="hover:text-zinc-300 transition-colors"><Camera size={20} /></button>
        </div>
        
        <input 
          type="text" 
          placeholder="Type your response... Ask Alex" 
          className="flex-1 bg-transparent border-none text-zinc-200 placeholder:text-zinc-700 text-sm focus:ring-0"
        />

        <Button className="h-10 px-6 rounded-full bg-blue-700 hover:bg-blue-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(29,78,216,0.3)]">
          Send
        </Button>
      </div>
    </div>
  );
};