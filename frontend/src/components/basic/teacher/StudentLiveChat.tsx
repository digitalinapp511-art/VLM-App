import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface Message {
  id: string;
  name: string;
  text: string;
  avatar: string;
}

const StudentLiveChat: React.FC = () => {
  const messages: Message[] = [
    { id: "1", name: "Leo Chang", text: "Can you re-explain the chain rule step?", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo" },
    { id: "2", name: "Nora Patel", text: "Great example!", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nora" },
    { id: "3", name: "Oliver Davis", text: "Is there a simpler way?", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver" },
  ];

  return (
    <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-6">
      <h3 className="text-center text-[13px] font-black text-zinc-100 uppercase tracking-[0.2em] border-b border-white/5 pb-4">
        Student Live Chat
      </h3>
      
      <div className="space-y-5">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={msg.id} 
            className="flex gap-4 items-start"
          >
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback className="bg-zinc-800 text-white text-[10px]">
                {msg.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h4 className="text-[13px] font-bold text-zinc-100">{msg.name}</h4>
              <p className="text-[12px] text-zinc-400 font-medium leading-tight">
                {msg.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentLiveChat;