import React, { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Calendar, Landmark, Home, LayoutGrid, UserCircle, History } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import StatusToggle from "@/components/basic/teacher/StatusToggle";
import EmptyStateCard from "@/components/basic/teacher/EmptyStateCard";
import RequestActionButton from "@/components/basic/teacher/RequestActionButton";

const Requests: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-28 relative overflow-x-hidden", bgCss)}>

      {/* Header */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between py-6 mb-2">
        <div className="flex-1" /> {/* Spacer */}
        <h1 className="text-xl font-black text-white uppercase tracking-[0.2em] pr-2">
          Requests
        </h1>
        <div className="flex-1 flex justify-end">
          <div className="w-11 h-11 rounded-full border-2 border-cyan-400 bg-zinc-900 shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
        </div>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Top Toggle Section */}
        <StatusToggle isOnline={isOnline} onToggle={() => setIsOnline(!isOnline)} />

        {/* Empty State Card */}
        <EmptyStateCard />

        {/* Action Buttons List */}
        <div className="space-y-4 pt-2">
          <RequestActionButton icon={Rocket} label="Stay Online" variant="emerald" />
          <RequestActionButton icon={Calendar} label="View Schedule" />
          <RequestActionButton icon={History} label="Check Earnings" />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-xl px-8 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" />
        <NavItem icon={<LayoutGrid />} label="Requests" active />
        <NavItem icon={<Landmark />} label="Wallet" />
        <NavItem icon={<UserCircle />} label="Profile" />
      </nav>

      {/* Background Decorative Glow */}
      <div className="fixed bottom-1/4 right-0 w-40 h-40 bg-yellow-500/5 blur-[80px] pointer-events-none" />
    </div>
  );
};

// Internal Navigation Item
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
  )}>
    <div className={cn("relative transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]")}>
      {React.cloneElement(icon as React.ReactElement<any>, ({ size: 24, strokeWidth: active ? 2.5 : 1.5 } as any))}
      {active && (
        <motion.div
          layoutId="activeTabGlow"
          className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full -z-10"
        />
      )}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);

export default Requests;