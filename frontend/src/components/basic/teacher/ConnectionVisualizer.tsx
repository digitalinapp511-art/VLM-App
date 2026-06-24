import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ParticipantProps {
  name: string;
  role: string;
  imageUrl: string;
  glowColor: "cyan" | "gold";
}

const Participant: React.FC<ParticipantProps> = ({ name, role, imageUrl, glowColor }) => {
  const glowStyles = {
    cyan: "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]",
    gold: "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]"
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("w-20 h-20 rounded-full border-2 p-1 relative", glowStyles[glowColor])}>
        <Avatar className="w-full h-full">
          <AvatarImage src={imageUrl} />
          <AvatarFallback className="bg-zinc-800 text-white font-bold text-xl">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="text-center">
        <h4 className="text-sm font-bold text-white tracking-tight">{name}</h4>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">{role}</p>
      </div>
    </div>
  );
};

const ConnectionVisualizer: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Participant 
        name="Dr. Elena Petrova" 
        role="Faculty" 
        imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" 
        glowColor="cyan" 
      />
      
      {/* Connector Line */}
      <div className="w-[3px] h-12 bg-gradient-to-b from-cyan-400 via-yellow-400 to-yellow-400 rounded-full" />

      <Participant 
        name="Eleanor Reed" 
        role="Student" 
        imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Eleanor" 
        glowColor="gold" 
      />
    </div>
  );
};

export default ConnectionVisualizer;