import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Landmark, UserCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import { RequestsHeader, StatusToggle } from "@/components//basic/teacher/RequestsHeader";
import NoRequestsCard from "@/components/basic/teacher/NoRequestsCard";
import { RequestActions } from "@/components/basic/teacher/RequestActions";

const RequestsPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      {/* Background Decorative Element */}
      <div className="fixed bottom-1/4 right-0 w-64 h-64 bg-yellow-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Main Container - Responsive Constraint */}
      <div className="w-full max-w-xl flex flex-col gap-6 h-full">
        
        <RequestsHeader />

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 flex-1 flex flex-col"
        >
          <StatusToggle 
            isOnline={isOnline} 
            onToggle={() => setIsOnline(!isOnline)} 
          />

          <NoRequestsCard />

          <div className="pt-2">
            <RequestActions />
          </div>
        </motion.div>
      </div>

      {/* Persistent Responsive Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-xl px-8 py-4 flex justify-center z-50">
        <div className="w-full max-w-xl flex items-center justify-between">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<LayoutGrid />} label="Schedule" active />
          <NavItem icon={<Landmark />} label="Earnings" />
          <NavItem icon={<UserCircle />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
      {active && (
        <motion.div 
           layoutId="nav-glow"
           className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full -z-10"
        />
      )}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);

export default RequestsPage;