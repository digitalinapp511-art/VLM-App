import type { ReactNode } from "react";
import { LayoutDashboard, BookOpen, Calendar, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { bgCss } from "@/helper/CssHelper";

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
}

const NavItem = ({ icon: Icon, label, active }: NavItemProps) => (
  <div className={cn(
    "flex flex-col items-center gap-1 cursor-pointer transition-colors",
    active ? "text-cyan-400" : "text-white/40 hover:text-white/60"
  )}>
    <div className={cn("p-1", active && "bg-cyan-400/10 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.2)]")}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className="text-[10px] font-medium tracking-tight">{label}</span>
  </div>
);

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(bgCss, "min-h-screen w-full bg-[#050505] flex flex-col items-center overflow-x-hidden pb-24")}>
      <main className="w-full max-w-xl px-5 pt-8">
        {children}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between md:justify-around items-center z-50">
        <NavItem icon={LayoutDashboard} label="Dashboard" active />
        <NavItem icon={BookOpen} label="Learning" />
        <NavItem icon={Calendar} label="Planning" />
        <NavItem icon={MessageCircle} label="Messages" />
        <NavItem icon={User} label="Profile" />
      </nav>
    </div>
  );
}