import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Calendar, Landmark, UserCircle } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import InterruptionCard from "@/components/basic/teacher/InterruptionCard";

const SessionInterruption: React.FC = () => {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleReconnect = () => {
    setIsRetrying(true);
    // Simulate reconnection logic
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const handleReturn = () => navigate("/teacher/dashboard");

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black", bgCss)}>
      {/* Container for centering content on both Mobile & Laptop */}
      <div className="w-full max-w-4xl flex-1 flex flex-col px-4 md:px-8">
        
        {/* App Header */}
        <header className="py-10 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            VLM Academy
          </h1>
        </header>

        {/* Vertical Center Content */}
        <div className="flex-1 flex flex-col justify-center pb-24 md:pb-32">
          <InterruptionCard 
            onReconnect={handleReconnect} 
            onReturn={handleReturn}
            isRetrying={isRetrying}
          />
        </div>
      </div>

      {/* Persistent Bottom Navigation - Constrained to max-width on Desktop */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-white/5 py-4 px-6 flex justify-center z-50">
        <div className="w-full max-w-xl flex items-center justify-between">
          <NavItem icon={<Home />} label="Home" />
          <NavItem icon={<Calendar />} label="Sessions" active />
          <NavItem icon={<Landmark />} label="Earnings" />
          <NavItem icon={<UserCircle />} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

// Internal Navigation Helper
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={cn(
    "flex flex-col items-center gap-1.5 transition-all duration-300",
    active ? "text-white opacity-100" : "text-zinc-500 opacity-60 hover:opacity-100"
  )}>
    <div className="relative">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
      {active && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full blur-[2px]" />
      )}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);

export default SessionInterruption;