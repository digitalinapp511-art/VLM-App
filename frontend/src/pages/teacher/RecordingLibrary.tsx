import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Home, BookOpen, Wallet, Library, User } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { PATHS } from "@/routes/paths";

import VideoPlayer from "@/components/basic/teacher/VideoPlayer";
import { RecordingSecurityDetails } from "@/components/basic/teacher/RecordingInfoBadges";
import RelatedSessionCard from "@/components/basic/teacher/RelatedSessionCard";

const RecordingLibrary: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col p-6 pb-28 relative", bgCss)}>
      {/* Header */}
      <header className="flex items-center mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-white relative shadow-xl"
        >
          <ChevronLeft size={24} />
          {/* Bottom pointer detail for the button */}
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45" />
        </button>
        <h1 className="flex-1 text-center text-xl font-black text-white uppercase tracking-[0.1em] mr-12">
          Recording Library
        </h1>
      </header>

      <div className="max-w-xl mx-auto w-full space-y-8">
        {/* Main Recording Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-[40px] border-2 border-cyan-500/20 bg-zinc-950/40 backdrop-blur-2xl relative overflow-hidden",
            "shadow-[0_0_40px_rgba(34,211,238,0.1)]"
          )}
        >
          <div className="space-y-8">
            <VideoPlayer />

            <div className="space-y-6">
              <h2 className="text-[22px] font-black text-white leading-tight uppercase tracking-tight">
                Advanced Algebra -<br />
                Quadratic Equations &<br />
                Systems
              </h2>

              <div className="flex items-end justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date:</p>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Mon, Nov 1, 2023</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duration:</p>
                    <p className="text-sm font-black text-white uppercase tracking-tight">45 Minutes</p>
                  </div>
                </div>

                <RecordingSecurityDetails />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Sessions */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">
            Related Sessions
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
            <RelatedSessionCard title="Linear Algebra 101" />
            <RelatedSessionCard title="Calculus Concepts" />
            <RelatedSessionCard title="Statistics Advanced" />
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" active onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

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

export default RecordingLibrary;