import React, { useState } from "react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import SessionFilterTabs from "@/components/basic/teacher/SessionFilters";
import SessionCard from "@/components/basic/teacher/SessionItemCard";
import { Home, History, Landmark, User } from "lucide-react";

const TeachSessionHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const sessions = [
    {
      studentName: "Aisha Gupta",
      grade: "Grade 10",
      subject: "Physics",
      duration: "45 mins",
      earnings: "15.00",
      date: "Oct 25, 2024, 10:30 AM",
      status: "RESOLVED" as const,
    },
    {
      studentName: "Rohan Sharma",
      grade: "Grade 8",
      subject: "Mathematics",
      duration: "60 mins",
      earnings: "20.00",
      date: "Oct 24, 2024, 4:00 PM",
      status: "RESOLVED" as const,
    },
    {
      studentName: "Priya Singh",
      grade: "Grade 12",
      subject: "Biology",
      duration: "30 mins",
      earnings: "10.00",
      date: "Oct 23, 2024, 9:15 AM",
      status: "UNRESOLVED" as const,
    },
  ];

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-[#050505] p-4 pb-28", bgCss)}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="w-8" /> {/* Spacer */}
          <h1 className="text-xl font-black text-white tracking-[0.15em] uppercase">
            Session History
          </h1>
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
        </header>

        {/* Filter Tabs */}
        <SessionFilterTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Sessions List */}
        <div className="mt-2">
          {sessions.map((session, index) => (
            <SessionCard key={index} {...session} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<History />} label="Sessions" active />
        <NavItem icon={<Landmark />} label="Earnings" />
        <NavItem icon={<User />} label="Profile" />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default TeachSessionHistory;