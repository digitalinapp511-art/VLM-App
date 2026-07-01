import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { PATHS } from "@/routes/paths";
import { TrendingUp, Home, BookOpen, Wallet, Library, User, ArrowLeft, History } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import ReferralTypeCard from "@/components/basic/teacher/ReferralTypeCard";
import ActiveLinkCard from "@/components/basic/teacher/ActiveLinkCard";

const RewardCenter: React.FC = () => {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["teacherWallet"],
    queryFn: teacherApi.getWallet,
  });

  const wallet = walletData?.wallet || {};
  const pointsToInr = walletData?.pointsToInr || 10;
  const pointsVal = wallet.totalPoints || 0;
  const inrVal = pointsVal / pointsToInr;

  const firstName = profile?.fullName?.split(" ")[0] ?? "Teacher";

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      
      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Refer & Earn Dashboard</p>
            <h1 className="text-2xl font-black text-white tracking-tight">Reward Center</h1>
          </div>
        </div>
        <Avatar className="w-11 h-11 border-2 border-white/10">
          <AvatarImage src={profile?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`} />
          <AvatarFallback>{firstName[0]}</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Referral Type Selector */}
        <div className="flex gap-4">
          <ReferralTypeCard type="student" bonus="500 Pts" onClick={() => navigate(PATHS.REFER_STUDENT)} />
          <ReferralTypeCard type="teacher" bonus="1000 Pts" onClick={() => navigate(PATHS.REFER_TEACHER)} />
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] flex flex-col justify-between min-h-[120px]">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Referrals</span>
            <div className="flex items-center gap-2">
               <span className="text-3xl font-black text-white">{isLoading ? "..." : "15"}</span>
               <TrendingUp className="text-emerald-500" size={20} />
            </div>
          </div>
          
          <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] flex flex-col justify-between min-h-[120px] relative overflow-hidden">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Referral Points Earned</span>
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-white tracking-tight">
                 {isLoading ? "..." : `${pointsVal.toLocaleString("en-IN")} Pts`}
               </h3>
               <p className="text-[10px] font-bold text-zinc-500">
                 INR Equivalent: {isLoading ? "..." : `₹ ${inrVal.toLocaleString("en-IN")}`}
               </p>
            </div>
            <div className="absolute bottom-2 right-2 opacity-40">💰</div>
          </div>
        </div>

        {/* Active Links Section */}
        <section className="space-y-5">
           <div className="flex items-center justify-between ml-2">
              <h2 className="text-lg font-black text-white tracking-tight">Active Referral Links</h2>
              <button
                onClick={() => navigate(PATHS.TEACHER_REFERRAL_HISTORY)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <History size={14} />
                View History
              </button>
           </div>
           <div className="space-y-4">
              <ActiveLinkCard 
                title="Mathematics Course for Grade 8"
                date="Oct 22, 2024"
                id="VLM-SR-54321"
                link="vlm.academy/sr/54321"
              />
              <ActiveLinkCard 
                title="Primary Teacher Training Program"
                date="Oct 21, 2024"
                id="VLM-TR-12345"
                link="vlm.academy/sr/12345"
              />
           </div>
        </section>
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
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default RewardCenter;