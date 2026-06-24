import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LayoutDashboard, PlusCircle, Library, BarChart3, Settings } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import VideoStatusCard from "@/components/basic/teacher/VideoStatusCard";

const ShortVideoApprovalStatus: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-24 relative overflow-x-hidden", bgCss)}>
      {/* Header Capsule */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between p-4 rounded-full border border-white/10 bg-zinc-950/40 backdrop-blur-md mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">User Profile | VLM Academy</span>
           <h1 className="text-sm font-black text-white uppercase tracking-widest text-center">
             Short Video Approval <br /> Status
           </h1>
        </div>
        <Avatar className="w-10 h-10 border border-white/20">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-2">
        <h2 className="text-[13px] font-black text-zinc-100 uppercase tracking-[0.2em] ml-2 mb-6">
          My Short Videos
        </h2>

        {/* Video List */}
        <VideoStatusCard
          title="Title"
          status="approved"
          views="24k"
        />
        
        <VideoStatusCard
          title="Title"
          status="pending"
          views="12k"
        />

        <VideoStatusCard
          title="Title"
          status="rejected"
          views="150"
        />
      </div>

      {/* Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 rounded-full border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl shadow-2xl flex items-center justify-around px-4 z-50">
        <TabItem icon={<LayoutDashboard size={22} />} label="Dashboard" active />
        <TabItem icon={<PlusCircle size={22} />} label="Create" />
        <TabItem icon={<Library size={22} />} label="Library" />
        <TabItem icon={<BarChart3 size={22} />} label="Analytics" />
        <TabItem icon={<Settings size={22} />} label="Settings" />
      </nav>
    </div>
  );
};

// Internal Helper for Tab Items
const TabItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
  )}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    {active && <motion.div layoutId="activeTab" className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
  </button>
);

export default ShortVideoApprovalStatus;