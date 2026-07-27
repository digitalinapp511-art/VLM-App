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

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";

const EarningsHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Video");

  const getEarningTypeParam = (tab: string) => {
    switch (tab) {
      case "Chat":
        return "chat";
      case "Audio":
        return "audio";
      case "Video":
        return "video";
      case "Live Class":
        return "live_class";
      case "Short Video":
        return "short_video";
      default:
        return "video";
    }
  };

  const { data: earnings = [], isLoading } = useQuery({
    queryKey: ["teacherEarnings", activeTab],
    queryFn: () => teacherApi.getEarnings({ type: getEarningTypeParam(activeTab) }),
  });

  const getHistoryItemType = (earningType: string, txType: string) => {
    if (txType === "debit") return "penalty";
    switch (earningType) {
      case "chat":
      case "doubt":
      case "audio":
        return "chat";
      case "video":
        return "video_lesson";
      case "live_class":
        return "live_class";
      case "short_video":
        return "short_video";
      default:
        return "video_lesson";
    }
  };

  const formatTimestamp = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
            Earning Details
          </h3>

          <div className="flex flex-col">
            {isLoading ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Loading earnings history...</p>
            ) : earnings.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No earnings recorded for this category</p>
            ) : (
              earnings.map((tx: any) => (
                <HistoryItem
                  key={tx._id || tx.id}
                  type={getHistoryItemType(tx.earningType, tx.type)}
                  title={tx.description || (tx.type === "credit" ? "Earning Credited" : "Wallet Debit")}
                  subtitle={tx.sessionId ? `Session: #${tx.sessionId.slice(-6).toUpperCase()}` : "System Transaction"}
                  timestamp={formatTimestamp(tx.createdAt)}
                  points={String(tx.points || 0)}
                  isNegative={tx.type === "debit"}
                />
              ))
            )}
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