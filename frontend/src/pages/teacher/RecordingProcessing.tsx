import React from "react";
import { motion } from "framer-motion";
import { Library, LayoutDashboard, Users, UserCircle, Play } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import ProcessingHeader from "@/components/basic/teacher/ProcessingHeader";
import CircularProgress from "@/components/basic/teacher/CircularProgress";

const RecordingProcessing: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black pb-28", bgCss)}>
      <ProcessingHeader />

      <motion.main
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl px-4"
      >
        {/* Main Processing Card */}
        <div className="w-full bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          {/* Card Header Info */}
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">V</span>
                </div>
                <span className="text-white font-black text-sm uppercase tracking-widest">VLM Academy</span>
              </div>
              <Badge className="bg-zinc-800 text-zinc-300 border-none font-bold text-[10px] py-1 px-4 rounded-full uppercase tracking-tighter">
                App Only | Content
              </Badge>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                Physics 101 | Session ID: 1024
              </h2>
              <p className="text-zinc-500 font-bold text-xs">August 26, 2024</p>
            </div>
          </div>

          {/* Centered Progress Visual */}
          <CircularProgress percentage={45} />

          {/* Status Text */}
          <div className="text-center space-y-4 mb-10">
            <h3 className="text-3xl font-black text-white uppercase tracking-tight">
              Recording Processing
            </h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed px-6">
              Your recording is being prepared and optimized for playback. This usually takes a few minutes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-2xl border-zinc-700 bg-transparent text-zinc-400 font-black uppercase tracking-widest hover:bg-white/5"
            >
              View Details
            </Button>
            <Button
              className={cn(
                "flex-1 h-14 rounded-2xl font-black uppercase tracking-widest",
                "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] text-white shadow-[0_0_25px_rgba(59,130,246,0.3)] border border-blue-400/20"
              )}
            >
              Notify Me
            </Button>
          </div>
        </div>

        {/* Footer Related Content Section */}
        <div className="mt-12 space-y-6">
          <h4 className="text-zinc-300 font-black text-center uppercase tracking-widest text-lg">
            Chemistry
          </h4>
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                 <Play size={24} className="text-white opacity-60 ml-1" />
              </div>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Physics 100</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                 <Play size={24} className="text-white opacity-60 ml-1" />
              </div>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Chemistry Basics</span>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Persistent Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-t border-white/5 py-4 px-8 flex justify-center z-50">
        <div className="w-full max-w-xl flex items-center justify-between">
          <NavItem icon={<Library />} label="Library" active />
          <NavItem icon={<LayoutDashboard />} label="Dashboard" />
          <NavItem icon={<Users />} label="Students" />
          <NavItem icon={<UserCircle />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-white" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative", active && "scale-110")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-white shadow-[0_0_10px_white]"
        />
      )}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default RecordingProcessing;