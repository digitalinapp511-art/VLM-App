import React from "react";
import { motion } from "framer-motion";
import { Home, BookOpen, Wallet, Library, UserCircle, ChevronRight } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import WithdrawalHeader from "@/components/basic/teacher/WithdrawalHeader";
import ProcessingVisual from "@/components/basic/teacher/ProcessingVisual";
import { AmountCard, PayoutCard } from "@/components/basic/teacher/WithdrawalDetails";
import WithdrawalTimeline from "@/components/basic/teacher/WithdrawalTimeline";

const WithdrawalProcess: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 pb-32", bgCss)}>
      {/* Constraints for Laptop/Tablet viewports */}
      <div className="w-full max-w-xl flex flex-col gap-6">
        <WithdrawalHeader />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <ProcessingVisual />
          
          <AmountCard amount="2,500,000" points="250,000" />
          
          <PayoutCard />
          
          <WithdrawalTimeline />

          <p className="text-[10px] text-zinc-600 font-bold text-center leading-relaxed px-4">
            *IMPS transfers usually take seconds to minutes after completion.
          </p>

          <div className="flex justify-center pt-2">
            <button className="flex items-center gap-2 text-[13px] font-black text-cyan-400 uppercase tracking-widest group">
              Need Assistance? <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-400/30 rounded-full" />
            </button>
          </div>
        </motion.main>
      </div>

      {/* Responsive Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-t border-white/5 py-4 px-8 flex justify-center z-50">
        <div className="w-full max-w-xl flex items-center justify-between">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<BookOpen />} label="Classes" />
          <NavItem icon={<Wallet />} label="Wallet" active />
          <NavItem icon={<Library />} label="Library" />
          <NavItem icon={<UserCircle />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
      {active && (
        <motion.div layoutId="navDot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]" />
      )}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight mt-1">{label}</span>
  </button>
);

export default WithdrawalProcess;