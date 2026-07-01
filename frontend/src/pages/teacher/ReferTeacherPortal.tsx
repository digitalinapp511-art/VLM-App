import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, BookOpen, Wallet, Library, User, Users, CheckCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PATHS } from "@/routes/paths";

import { LinkShareInput, ReferralCodeBox } from "@/components/basic/teacher/ReferralActions";
import QrScanArea from "@/components/basic/teacher/QrScanArea";

const ReferTeacherPortal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>

      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            Refer Teacher Portal
          </h1>
        </div>
        <Avatar className="w-11 h-11 border-2 border-white/10">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Milestones Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[32px] border border-white/5 bg-zinc-950/40 backdrop-blur-xl space-y-4"
        >
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Teacher Referral Milestones</h3>
          
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Tier 1</span>
              <span className="text-xs font-black text-emerald-400 mt-1">+500 Pts</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Tier 2</span>
              <span className="text-xs font-black text-cyan-400 mt-1">+1500 Pts</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Tier 3</span>
              <span className="text-xs font-black text-yellow-500 mt-1">2500 Bonus</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
              <span>Progress: 3/5 Active</span>
              <span>60%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
              <div className="h-full bg-cyan-400" style={{ width: "60%" }} />
            </div>
          </div>

          <p className="text-[9px] text-zinc-600 text-center font-semibold italic">
            *Teachers count as active after their first paid student enrollment.*
          </p>
        </motion.div>

        {/* Sentinel Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
            <Users className="text-zinc-500" size={24} />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Sent Invites</span>
              <span className="text-xl font-black text-white">15</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
            <CheckCircle className="text-emerald-500" size={24} />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Joined Teachers</span>
              <span className="text-xl font-black text-white">4 <span className="text-xs text-zinc-500">(3 Active)</span></span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <LinkShareInput link="vlm.academy/tr/54321/teacher1" />
          <ReferralCodeBox code="TEACHER1-TFR54" />
          <QrScanArea />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" active onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

// Internal Nav Item Helper
const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={cn(
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

export default ReferTeacherPortal;
