import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, HelpCircle, LineChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { bgCss } from "@/helper/CssHelper";
import { PATHS } from "@/routes/paths";

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 cursor-pointer transition-colors border-none bg-transparent outline-none focus:outline-none",
      active ? "text-cyan-400" : "text-white/40 hover:text-white/60"
    )}
  >
    <div className={cn("p-1", active && "bg-cyan-400/10 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.2)]")}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className="text-[10px] font-medium tracking-tight">{label}</span>
  </button>
);

export default function ParentLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardActive = location.pathname === PATHS.PARENT_DASHBOARD;
  const isDoubtActive = location.pathname === PATHS.PARENT_DOUBTHISTORY;
  const isAnalyticsActive = location.pathname === PATHS.PARENT_ANALYTICS;
  const isLearningActive = location.pathname === PATHS.PARENT_LIVEACTIVITY;
  const isSettingsActive = location.pathname === PATHS.PARENT_PROFILE;

  return (
    <div className={cn(bgCss, "min-h-screen w-full bg-[#050505] flex flex-col items-center overflow-x-hidden pb-24")}>
      <main className="w-full max-w-xl px-5 pt-4">
        {children}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between md:justify-around items-center z-50">
        <NavItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={isDashboardActive} 
          onClick={() => navigate(PATHS.PARENT_DASHBOARD)} 
        />
        <NavItem 
          icon={HelpCircle} 
          label="Doubts" 
          active={isDoubtActive} 
          onClick={() => navigate(PATHS.PARENT_DOUBTHISTORY)} 
        />
        <NavItem 
          icon={LineChart} 
          label="Analytics" 
          active={isAnalyticsActive}
          onClick={() => navigate(PATHS.PARENT_ANALYTICS)} 
        />
        <NavItem 
          icon={BookOpen} 
          label="Learning" 
          active={isLearningActive} 
          onClick={() => navigate(PATHS.PARENT_LIVEACTIVITY)} 
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={isSettingsActive}
          onClick={() => navigate(PATHS.PARENT_PROFILE)} 
        />
      </nav>
    </div>
  );
}