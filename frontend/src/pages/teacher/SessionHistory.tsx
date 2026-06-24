import React, { useState } from "react";
// import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Mic, 
  Video, 
  Monitor, 
  Home, 
  History, 
  Landmark, 
  UserCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bgCss } from "@/helper/CssHelper";

import FilterTab from "@/components/basic/teacher/FilterTab";
import HistoryCard from "@/components/basic/teacher/HistoryCard";
// import type {   } from "@/types/teacher-types";

const SessionHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const sessions = [
    {
      studentName: "Aisha Gupta",
      grade: "Grade 10",
      subject: "Physics",
      duration: "45 mins",
      earnings: "15.00",
      date: "Oct 25, 2024, 10:30 AM",
      status: "RESOLVED" ,
    },
    {
      studentName: "Rohan Sharma",
      grade: "Grade 8",
      subject: "Mathematics",
      duration: "60 mins",
      earnings: "20.00",
      date: "Oct 24, 2024, 4:00 PM",
      status: "RESOLVED" 
    },
    {
      studentName: "Priya Singh",
      grade: "Grade 12",
      subject: "Biology",
      duration: "30 mins",
      earnings: "10.00",
      date: "Oct 23, 2024, 9:15 AM",
      status: "UNRESOLVED" 
    },
  ];

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-[#050505] pb-28", bgCss)}>
      {/* Laptop Constraint Container */}
      <div className="w-full max-w-xl px-4 flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between py-8 px-2">
          <div className="w-10 h-10 invisible" /> {/* Spacer */}
          <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">
            Session History
          </h1>
          <div className="w-11 h-11 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-zinc-900" />
        </header>

        {/* Filter Tabs Row */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-6">
          <FilterTab 
            icon={MessageSquare} 
            label="Chat" 
            active={activeTab === "chat"} 
            onClick={() => setActiveTab("chat")} 
          />
          <FilterTab 
            icon={Mic} 
            label="Audio" 
            active={activeTab === "audio"} 
            onClick={() => setActiveTab("audio")} 
          />
          <FilterTab 
            icon={Video} 
            label="Video" 
            active={activeTab === "video"} 
            onClick={() => setActiveTab("video")} 
          />
          <FilterTab 
            icon={Monitor} 
            label="Live Class" 
            active={activeTab === "live"} 
            onClick={() => setActiveTab("live")} 
          />
        </div>

        {/* Cards List */}
        <div className="flex flex-col">
          {sessions.map((session, index) => (
            <HistoryCard key={index} {...session} />
          ))}
        </div>
      </div>

      {/* Optimized Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 py-4 px-8 flex justify-center z-50">
        <div className="w-full max-w-xl flex items-center justify-between">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<History />} label="Sessions" active />
          <NavItem icon={<Landmark />} label="Earnings" />
          <NavItem icon={<UserCircle />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

// Internal Helper for Navigation
const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight mt-0.5">{label}</span>
    {active && (
      <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]" />
    )}
  </button>
);

export default SessionHistory;