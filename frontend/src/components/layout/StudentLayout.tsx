import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, HelpCircle, FileText, Tv, User } from "lucide-react";
import { PATHS } from "@/routes/paths";

export default function StudentLayout() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: PATHS.STUDENT_DASHBOARD },
    { icon: HelpCircle, label: "Doubt", path: PATHS.ASK_DOUBT },
    { icon: FileText, label: "MCQ", path: PATHS.MCQ },
    { icon: Tv, label: "Live", path: PATHS.LIVE_CLASSES },
    { icon: User, label: "Profile", path: PATHS.PROFILE },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex-1">
        <Outlet />
      </div>

      <nav className="sticky bottom-0 left-0 max-w-xl md:max-w-full m-auto rounded-xl md:rounded-none w-full h-20 bg-slate-900 backdrop-blur-xl border-t border-white/9 px-6 md:px-12 lg:px-24 flex items-center justify-between z-50">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={<item.icon size={24} />}
            label={item.label}
            to={item.path}
            active={location.pathname === item.path}
          />
        ))}
      </nav>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
}

function NavItem({ icon, label, to, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 outline-none",
        active ? "text-cyan-400 scale-110" : "text-white hover:text-white/60"
      )}
    >
      <div className={cn("transition-transform", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]")}>
        {icon}
      </div>
      <span className={cn("text-[10px] font-bold tracking-tight")}>{label}</span>

      {active && (
        <div className="h-1 w-1 bg-cyan-400 rounded-full animate-in fade-in zoom-in" />
      )}
    </Link>
  );
}
