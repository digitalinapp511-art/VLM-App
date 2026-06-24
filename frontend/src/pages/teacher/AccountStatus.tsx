import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Lock, Home, History, Landmark, UserCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import SuspendedHero from "@/components/basic/teacher/SuspendedHero";
import StatusReviewBox from "@/components/basic/teacher/StatusReviewBox";

const AccountStatus: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      
      {/* Header */}
      <header className="flex items-center justify-between py-6 max-w-xl mx-auto w-full px-2">
        <div className="flex-1" /> {/* Spacer */}
        <h1 className="text-xl font-black text-white tracking-[0.1em] uppercase">
          Account Status
        </h1>
        <div className="flex-1 flex justify-end">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-zinc-900 shadow-inner" />
        </div>
      </header>

      <div className="w-full max-w-xl mx-auto flex-1">
        {/* Main Status Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-8 rounded-[40px] border border-red-500/20 bg-zinc-950/60 backdrop-blur-3xl relative overflow-hidden",
            "shadow-[0_0_50px_rgba(239,68,68,0.05)]"
          )}
        >
          {/* Subtle Red Gradients */}
          <div className="absolute -top-24 left-0 w-full h-48 bg-red-600/5 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 left-0 w-full h-48 bg-red-600/5 blur-[100px] pointer-events-none" />

          <SuspendedHero />

          {/* Reason Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 mb-8 text-center space-y-4 px-2"
          >
            <div className="space-y-1">
              <p className="text-[13px] font-bold text-zinc-300">
                Suspension Type: <span className="text-zinc-400 font-medium ml-1">Policy Violation</span>
              </p>
              <p className="text-[13px] font-bold text-zinc-300 leading-tight">
                Reason: <span className="text-zinc-400 font-medium ml-1">Violation of Community Guidelines regarding language and content within student sessions.</span>
              </p>
            </div>

            <p className="text-[12px] text-zinc-500 font-medium leading-relaxed italic">
              VLM Academy is committed to maintaining a safe learning environment. A serious breach of trust has been identified based on internal reviews. Your account functionalities have been restricted.
            </p>
          </motion.div>

          <StatusReviewBox caseId="VLM-2934" targetDate="[Date]" />

          {/* Support Button */}
          <div className="mt-8">
            <Button className={cn(
              "w-full h-16 rounded-full border border-red-500/40 bg-zinc-950/60 text-white font-black uppercase tracking-widest",
              "flex items-center justify-between px-8 hover:bg-red-500/5 transition-all group"
            )}>
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-red-500" />
                <span>Contact Support</span>
              </div>
              <Lock size={18} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-xl px-8 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<History />} label="Sessions" />
        <NavItem icon={<Landmark />} label="Earnings" />
        <NavItem icon={<UserCircle />} label="Profile" active />
      </nav>
    </div>
  );
};

// Internal Navigation Item Helper
const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-red-500" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default AccountStatus;