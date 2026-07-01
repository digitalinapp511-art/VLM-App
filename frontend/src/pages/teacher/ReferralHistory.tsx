import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Users, UserRound, CircleDollarSign, Home, Wallet, History, User, BookOpen, Library } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import ReferralStatsCard from "@/components/basic/teacher/ReferralStatsCard";
import ReferralItemCard from "@/components/basic/teacher/ReferralItemCard";
import type{ ReferralStatus } from "@/components/basic/teacher/ReferralItemCard";

const ReferralHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  const referrals = [
    { name: "Alice Green", status: "CREDITED" as ReferralStatus, date: "Oct 12, 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" },
    { name: "Bob Brown", status: "VERIFIED" as ReferralStatus, date: "Oct 10, 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" },
    { name: "Charlie Davis", status: "ELIGIBLE" as ReferralStatus, date: "Oct 08, 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie" },
    { name: "David Evans", status: "REGISTERED" as ReferralStatus, date: "Oct 06, 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { name: "Eve Foster", status: "CLICKED" as ReferralStatus, date: "Oct 04, 2024", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve" },
  ];

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      
      {/* Header */}
      <header className="flex items-center justify-between py-6 mb-2">
        <h1 className="text-2xl font-serif font-black text-white uppercase tracking-[0.1em]">
          Referral History
        </h1>
        <Avatar className="w-11 h-11 border-2 border-white/10 ring-4 ring-white/5">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="flex gap-3">
          <ReferralStatsCard 
            variant="teal" 
            icon={<Users />} 
            value="120" 
            label="Total Student Referrals" 
          />
          <ReferralStatsCard 
            variant="purple" 
            icon={<UserRound />} 
            value="35" 
            label="Total Teacher Referrals" 
          />
          <ReferralStatsCard 
            variant="gold" 
            icon={<CircleDollarSign />} 
            value="75,000" 
            label="Total Points Earned" 
          />
        </div>

        {/* Custom Tabs */}
        <div className="p-1 rounded-full bg-white/[0.02] border border-white/5 flex gap-1">
          <button
            onClick={() => setActiveTab("student")}
            className={cn(
              "flex-1 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all relative",
              activeTab === "student" ? "text-white" : "text-zinc-500 hover:text-zinc-400"
            )}
          >
            {activeTab === "student" && (
              <motion.div layoutId="tabActive" className="absolute inset-0 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            )}
            <span className="relative z-10">Student Referrals</span>
          </button>
          <button
            onClick={() => setActiveTab("teacher")}
            className={cn(
              "flex-1 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all relative",
              activeTab === "teacher" ? "text-white" : "text-zinc-500 hover:text-zinc-400"
            )}
          >
            {activeTab === "teacher" && (
              <motion.div layoutId="tabActive" className="absolute inset-0 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
            )}
            <span className="relative z-10">Teacher Referrals</span>
          </button>
        </div>

        {/* List Section */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {referrals.map((item, idx) => (
                <ReferralItemCard key={idx} {...item} role="Student" />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" active onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

// Nav Item Helper
const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default ReferralHistory;