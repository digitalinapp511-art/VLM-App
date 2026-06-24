import React from "react";
import { motion } from "framer-motion";
import { Users, History, Home, BookOpen, Wallet, Library, UserCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import ReferralSuccessHeader from "@/components/basic/teacher/ReferralSuccessHeader";
import ReferralVisualizer from "@/components/basic/teacher/ReferralVisualizer";
import { ReferredUserCard, WalletPointsCard } from "@/components/basic/teacher/ReferralDetailCards";

const ReferralRewardCredited: React.FC = () => {
  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 pb-32", bgCss)}>
      {/* Container ensures laptop readability while maintaining mobile aspect ratio */}
      <div className="w-full max-w-xl flex flex-col gap-6">
        <ReferralSuccessHeader />
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <ReferralVisualizer />
          
          <ReferredUserCard />
          
          <WalletPointsCard />

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className={cn(
                "w-full h-16 rounded-2xl text-[15px] font-black uppercase tracking-widest gap-4 transition-all",
                "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
                "border border-blue-400/30 shadow-[0_0_30px_rgba(37,99,235,0.2)] text-white"
              )}>
                Refer More & Earn <Users size={20} />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className={cn(
                "w-full h-16 rounded-2xl border-white/10 bg-zinc-950/60 text-white font-black uppercase tracking-widest gap-3 hover:bg-zinc-800 transition-all"
              )}>
                <History size={20} />
                View Referral History
              </Button>
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-t border-white/5 py-4 px-8 flex justify-center z-50">
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

const NavItem = ({ icon, active = false }: { icon: any, active?: boolean }) => (
  <button className={cn(
    "p-2 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]")}>
      {React.cloneElement(icon, { size: 28, strokeWidth: active ? 2.5 : 1.5 })}
      {active && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
      )}
    </div>
  </button>
);

export default ReferralRewardCredited;