import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  RotateCcw, 
  Headset, 
  Home, 
  BookOpen, 
  Wallet, 
  Library, 
  UserCircle 
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { 
  FailureIllustration, 
  FailedStatusCard, 
  TransactionSummaryCard 
} from "@/components/basic/teacher/WithdrawalFailureComponents";

const WithdrawalFailed: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      
      {/* App Bar Header */}
      <header className="w-full max-w-xl mx-auto flex flex-col gap-4 pt-4 mb-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="text-xs">🔥</span>
              <div className="space-y-0.5">
                <h1 className="text-[15px] font-black text-white uppercase tracking-tight">Withdrawal Failed</h1>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                   Dr. Sarah Johnson | VLM-TR-1021
                </p>
              </div>
           </div>
           <div className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-zinc-900 shadow-inner" />
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        <FailureIllustration />
        
        <FailedStatusCard />
        
        <TransactionSummaryCard />

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button className={cn(
              "w-full h-16 rounded-2xl text-[15px] font-black uppercase tracking-widest gap-3",
              "bg-gradient-to-r from-[#f97316] to-[#ef4444] hover:brightness-110",
              "border border-white/10 shadow-[0_10px_30px_rgba(239,68,68,0.2)]"
            )}>
              <RotateCcw size={20} strokeWidth={2.5} />
              Retry Request
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button variant="outline" className={cn(
              "w-full h-16 rounded-2xl border border-white/10 bg-zinc-900/60 text-white font-black uppercase tracking-widest gap-3",
              "hover:bg-zinc-800 transition-all"
            )}>
              <Headset size={20} />
              Contact Support
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Responsive Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 py-4 px-8 flex justify-center z-50">
        <div className="w-full max-w-xl flex items-center justify-between">
          <NavItem icon={<Home />} />
          <NavItem icon={<BookOpen />} />
          <NavItem icon={<Wallet />} active />
          <NavItem icon={<Library />} />
          <NavItem icon={<UserCircle />} />
        </div>
      </nav>
    </div>
  );
};

// Internal Navigation Item
const NavItem = ({ icon, active = false }: { icon: any, active?: boolean }) => (
  <button className={cn(
    "p-2 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]")}>
      {React.cloneElement(icon, { size: 28, strokeWidth: active ? 2.5 : 1.5 })}
      {active && (
         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
      )}
    </div>
  </button>
);

export default WithdrawalFailed;