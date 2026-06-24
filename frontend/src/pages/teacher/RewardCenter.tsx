import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Home, BookOpen, Wallet, Library, User } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import ReferralTypeCard from "@/components/basic/teacher/ReferralTypeCard";
import ActiveLinkCard from "@/components/basic/teacher/ActiveLinkCard";

const RewardCenter: React.FC = () => {


  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      
      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Refer & Earn Dashboard</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Reward Center</h1>
        </div>
        <Avatar className="w-11 h-11 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Referral Type Selector */}
        <div className="flex gap-4">
          <ReferralTypeCard type="student" bonus="500 Pts" onClick={() => {}} />
          <ReferralTypeCard type="teacher" bonus="1000 Pts" onClick={() => {}} />
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] flex flex-col justify-between min-h-[120px]">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Referrals</span>
            <div className="flex items-center gap-2">
               <span className="text-3xl font-black text-white">15</span>
               <TrendingUp className="text-emerald-500" size={20} />
            </div>
          </div>
          
          <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] flex flex-col justify-between min-h-[120px] relative overflow-hidden">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Referral Points Earned</span>
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-white tracking-tight">175,000 Pts</h3>
               <p className="text-[10px] font-bold text-zinc-500">INR Equivalent: ₹ 1,75,000</p>
            </div>
            <div className="absolute bottom-2 right-2 opacity-40">💰</div>
          </div>
        </div>

        {/* Active Links Section */}
        <section className="space-y-5">
           <h2 className="text-lg font-black text-white tracking-tight ml-2">Active Referral Links</h2>
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
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<BookOpen />} label="Classes" />
        <NavItem icon={<Wallet />} label="Wallet" active />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<User />} label="Profile" />
      </nav>
    </div>
  );
};

// Nav Item Helper
const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default RewardCenter;