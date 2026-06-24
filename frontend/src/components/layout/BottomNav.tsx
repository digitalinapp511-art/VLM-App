// src/components/layout/BottomNav.tsx
import { 
  LayoutDashboard, BookOpen, Calendar, 
  MessageCircle, User 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: BookOpen, label: "Learning", id: "learning", active: true },
  { icon: Calendar, label: "Planning", id: "planning" },
  { icon: MessageCircle, label: "Messages", id: "messages" },
  { icon: User, label: "Profile", id: "profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full max-w-xl bg-black/90 backdrop-blur-2xl border-t border-white/5 px-6 pt-3 pb-8 flex justify-between items-center z-50">
      {NAV_ITEMS.map((item) => (
        <div 
          key={item.id}
          className={cn(
            "flex flex-col items-center gap-1.5 cursor-pointer group transition-all",
            item.active ? "text-cyan-400" : "text-white/40 hover:text-white/60"
          )}
        >
          <div className={cn(
            "p-1.5 transition-all",
            item.active && "bg-cyan-400/10 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.15)] border border-cyan-400/20"
          )}>
            <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
        </div>
      ))}
    </nav>
  );
}