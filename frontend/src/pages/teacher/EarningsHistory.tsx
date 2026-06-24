import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Home,
  BookOpen,
  Wallet,
  Library,
  User,
  Star
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import EarningsFilters from "@/components/basic/teacher/EarningsFilters";
import HistoryItem from "@/components/basic/teacher/HistoryItem";

const EarningsHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Video");

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>

      {/* Decorative Assets */}
      <div className="absolute top-20 -left-2 text-cyan-400/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
            <div className="w-4 h-4 bg-zinc-800 rounded-sm" />
          </div>
          <h1 className="text-base font-black text-white tracking-tight">Earnings History</h1>
        </div>

        <Avatar className="w-10 h-10 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Filters */}
        <EarningsFilters activeTab={activeTab} onTabChange={setActiveTab} />

        {/* History Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[40px] border-2 border-cyan-500/20 bg-zinc-950/40 backdrop-blur-2xl shadow-[0_0_40px_rgba(34,211,238,0.1)]"
        >
          <h3 className="text-[13px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-6">
            September 2024
          </h3>

          <div className="flex flex-col">
            <HistoryItem
              type="chat"
              title="Chat Session"
              subtitle="Doubt ID: #VLM-C-458"
              timestamp="Sep 29, 2024 • 10:15 AM"
              points="750"
            />
            <HistoryItem
              type="video_lesson"
              title="Video Lesson"
              subtitle="Student: Aisha C."
              timestamp="Sep 29, 2024 • 10:15 AM"
              points="3,500"
            />
            <HistoryItem
              type="live_class"
              title="Live Class"
              subtitle="Sep 29, 2024 • 10:15 AM"
              timestamp="Sep 29, 2024 • 10:15 AM"
              points="55,000"
            />
            <HistoryItem
              type="course"
              title="Course: Calculus 101"
              subtitle="Sep 29, 2024 • 10:15 AM"
              timestamp="Sep 29, 2024 • 10:15 AM"
              points="55,000"
            />
            <HistoryItem
              type="short_video"
              title="Short Video"
              subtitle="motion basics video"
              timestamp="Sep 29, 2024 • 10:15 AM"
              points="2,000"
            />
            <HistoryItem
              type="penalty"
              title="Penalty"
              subtitle="Content copyright violation"
              timestamp="Sep 28, 2024 • 10:05 AM"
              points="20,000"
              isNegative
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<BookOpen />} label="Classes" />
        <NavItem icon={<Wallet />} label="Wallet" active />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<User />} label="Profile" />
      </nav>
    </div>
  );
};

// Internal Nav Item Helper
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: active ? 2.5 : 1.5 } as any))}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default EarningsHistory;