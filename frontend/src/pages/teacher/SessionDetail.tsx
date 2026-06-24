import React from "react";
import { motion } from "framer-motion";
import { Video, User, Calendar, Clock, Pencil, Play, Home, History, Landmark, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { bgCss } from "@/helper/CssHelper";

import SessionDetailHeader from "@/components/basic/teacher/SessionDetailHeader";
import SessionStatusHero from "@/components/basic/teacher/SessionStatusHero";
import SessionRatingCard from "@/components/basic/teacher/SessionRatingCard";
const SessionDetail: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28", bgCss)}>
      <SessionDetailHeader />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl mx-auto space-y-4"
      >
        <SessionStatusHero />

        {/* Call Meta Card */}
        <motion.div variants={itemVariants} className="p-5 rounded-[28px] border border-white/10 bg-zinc-900/40 relative group">
          <button className="absolute top-4 right-5 text-zinc-600 hover:text-white transition-colors">
            <Pencil size={20} />
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-zinc-300">
              <Video size={18} className="text-zinc-500" />
              <span className="text-sm font-medium tracking-tight">[Video Call]</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <User size={18} className="text-zinc-500" />
              <span className="text-sm font-medium tracking-tight">[Grade 10 | Student]</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-zinc-300">
                <Calendar size={18} className="text-zinc-500" />
                <span className="text-sm font-medium tracking-tight">[Oct 25, 2024 | 10:30 AM]</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock size={18} />
                  <span className="text-sm font-bold">[45 mins]</span>
                </div>
                <div className="px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-black text-[9px] tracking-widest">
                   RESOLVED
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Problem Summary Card */}
        <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-white/10 bg-zinc-900/40 relative">
          <button className="absolute top-4 right-6 text-zinc-600">
            <Pencil size={20} />
          </button>
          <div className="space-y-4">
            <p className="text-[13px] text-zinc-300 leading-relaxed pr-6 font-medium">
              <span className="text-white font-bold">Problem summary:</span> Reviewed force diagrams and friction problems. Explained multiple-mass scenarios. Aisha demonstrated excellent understanding.
            </p>
            <p className="text-right text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
              Character / 500
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SessionRatingCard />
        </motion.div>

        {/* Video Preview Card */}
        <motion.div variants={itemVariants} className="p-4 rounded-[32px] border border-white/10 bg-zinc-900/40">
           <div className="w-full aspect-video rounded-[24px] bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center transition-transform group-hover:scale-110">
                <Play size={28} className="fill-white text-white ml-1" />
              </div>
           </div>
        </motion.div>
      </motion.main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-8 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<History />} label="Sessions" active />
        <NavItem icon={<Landmark />} label="Earnings" />
        <NavItem icon={<UserCircle />} label="Profile" />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600"
  )}>
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_cyan]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default SessionDetail;