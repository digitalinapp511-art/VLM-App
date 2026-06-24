import React from "react";
import { User, Video, MessageSquare, HelpCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import UploadErrorCard from "@/components/basic/teacher/UploadErrorCard";

const UploadError: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black", bgCss)}>
      {/* Laptop & Mobile Container Wrapper */}
      <div className="w-full max-w-xl flex-1 flex flex-col px-4 md:px-0">
        
        {/* Header */}
        <header className="py-8 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">VLM Academy</h1>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center pb-24">
          <UploadErrorCard 
            onRetry={() => console.log("Retrying...")} 
            onSupport={() => console.log("Support...")} 
          />
        </div>
      </div>

      {/* Persistent Bottom Navigation */}
      <nav className="w-full max-w-xl bg-black border-t border-white/5 backdrop-blur-xl flex items-center justify-around py-4 px-6 fixed bottom-0 left-1/2 -translate-x-1/2 z-50">
        <NavItem icon={<User />} label="Profile" active />
        <NavItem icon={<Video />} label="Classes" />
        <NavItem icon={<MessageSquare />} label="Messages" />
        <NavItem icon={<HelpCircle />} label="Help" />
        
        {/* Active Tab Indicator (the white line) */}
        <div className="absolute top-0 left-6 w-16 h-0.5 bg-white shadow-[0_0_10px_white]" />
      </nav>
    </div>
  );
};

// Internal Navigation Helper
const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1 transition-all duration-300",
    active ? "text-white" : "text-zinc-600 hover:text-zinc-400"
  )}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default UploadError;