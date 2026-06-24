import React from "react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Wallet, Library, User } from "lucide-react";
import { motion } from "framer-motion";

import { ChatHeader, ChatTimerBar } from "@/components/basic/teacher/ChatHeader";
import { TextBubble, ImageMessage, AudioMessage } from "@/components/basic/teacher/ChatMessage";
import { ChatInput } from "@/components/basic/teacher/ChatInp";

const ChatSession: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col bg-black", bgCss)}>
      {/* Constraints for desktop viewing while maintaining aspect ratio on mobile */}
      <div className="w-full max-w-xl lg:max-w-3xl mx-auto flex-1 flex flex-col relative overflow-hidden">
        
        <ChatHeader />
        <ChatTimerBar />

        {/* Scrollable Chat Content */}
        <main className="flex-1 flex flex-col p-4 overflow-y-auto no-scrollbar pb-10">
          <TextBubble variant="student">
            Can you help with the normal force equation on this inclined plane?
          </TextBubble>

          <TextBubble variant="teacher">
            Of course! Let me take a look at what you sent.
          </TextBubble>

          <ImageMessage />

          <AudioMessage />

          <TextBubble variant="student">
            Ah, I get it now! Thanks, Dr. Johnson!
          </TextBubble>
        </main>

        <ChatInput />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-black/95 border-t border-white/5 backdrop-blur-lg px-8 py-4 flex items-center justify-between z-50">
        <div className="max-w-xl mx-auto w-full flex justify-between">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<BookOpen />} label="Classes" />
          <NavItem icon={<Wallet />} label="Wallet (Generic)" active />
          <NavItem icon={<Library />} label="Library" />
          <NavItem icon={<User />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

// Internal Nav Item Helper
const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 1.5 })}
      {active && (
        <motion.div layoutId="navDot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
      )}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);

export default ChatSession;