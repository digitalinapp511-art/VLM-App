import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Bot, MessageCircle, Tv, Clock, 
  Video, BookOpen, Percent, Star,  
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

const fetchPlanDetails = async () => {
  try {
    const plans = await studentApi.getPlans();
    return plans.map((p: any, i: number) => ({
      id: i + 1,
      icon: [Bot, MessageCircle, Tv, Clock, Video, BookOpen, Percent][i % 7],
      label: p.name,
      current: i === 0 ? "Free / Basic" : plans[0]?.name ?? "Basic",
      premium: `₹${p.price}/mo`,
      subPremium: p.duration,
      promo: p.promo ?? "",
      isTeal: i % 2 === 0,
    }));
  } catch {
    return [];
  }
};

export default function PlanUpgrade() {
  const navigate = useNavigate();
  const { data: features, isLoading } = useQuery({
    queryKey: ["planComparison"],
    queryFn: fetchPlanDetails,
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className={`${bgCss}relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-5 overflow-x-hidden pb-10`}>
      <div className="max-w-xl">

      {/* ── BACKGROUND DECOR ── */}
      <div className="absolute top-[10%] left-[-20%] h-96 w-96 bg-purple-900/10 blur-[120px] pointer-events-none" />
      <Star className="absolute top-10 left-10 text-white/20 h-4 w-4" />
      <Star className="absolute top-[40%] right-2 text-purple-500/40 h-5 w-5 fill-current" />

      {/* ── HEADER ── */}
      <header className="relative z-10 flex w-full items-center justify-between mb-3">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => navigate(PATHS.PROFILE)}>
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-xl font-serif font-bold  uppercase">VLM Academy</h1>
        <div className="w-12" />
      </header>

      <h2 className="text-xl text-center font-black tracking-tight text-white mb-10 animate-in fade-in slide-in-from-top-2 duration-700">
        Upgrade Your Plan
      </h2>

      {/* ── MAIN COMPARISON AREA ── */}
      <main className="relative w-full max-w-xl">
        
        {/* Left Indicator (Triangle) */}
        <div className="absolute -top-10 left-2 z-10">
           <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
        </div>

        {/* Labels Above Comparison */}
        <div className="flex justify-between px-10 mb-8 items-start relative z-20">
           <div className="space-y-1">
              <p className="text-sm font-bold text-white tracking-tight">Current Plan</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">(Basic Learner)</p>
           </div>
           
           <div className="text-center translate-x-4">
              <p className="text-sm font-bold text-white tracking-tight">Unlock Premium+</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">(The Smart Move)</p>
           </div>
        </div>

        {/* ── THE COMPARISON BOX ── */}
        <div className="relative space-y-1 z-10">
          
          {/* PURPLE HIGHLIGHT BOX (The Glow Overlay) */}
          <div className="absolute right-0 top-0 bottom-0 w-[46%] rounded-[2rem] border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-purple-500/5 pointer-events-none z-0" />

          {/* Feature Rows */}
          {features?.map((item: { id: number; label: string; current: string; premium: string; subPremium: string; promo?: string; isTeal: boolean; icon: any }) => (
            <div key={item.id} className="relative flex items-center py-5 px-2 group">
              {/* Row Divider */}
              <Separator className="absolute bottom-0 left-0 right-0 bg-white/20" />

              {/* Left Side: Current Stats */}
              <div className="w-[45%] pr-14 text-left">
                <p className="text-xs font-bold text-white tracking-tight leading-tight">{item.id}. {item.label}</p>
                <p className="text-[10px] text-white/30 font-medium mt-1 leading-tight">{item.current}</p>
              </div>

              {/* Center: Icon Badge */}
              <div className="absolute left-1/2 -translate-x-1/2 z-20">
                 <div className="h-10 w-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center shadow-xl group-hover:border-purple-500/50 transition-colors">
                    <item.icon size={18} className="text-white/60" />
                 </div>
              </div>

              {/* Right Side: Premium Stats */}
              <div className="w-[55%] pl-14 text-left">
                <p className={cn(
                  "text-xs font-bold tracking-tight leading-tight",
                  item.isTeal ? "text-cyan-400" : "text-white"
                )}>
                  {item.premium}
                </p>
                {item.subPremium && <p className="text-[10px] text-white/50 font-medium mt-0.5 leading-tight">{item.subPremium}</p>}
                {item.promo && <p className="text-[10px] text-white/40 font-bold tracking-wider mt-0.5">{item.promo}</p>}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── UPGRADE BUTTON ── */}
      <footer className="mt-auto w-full max-w-md pt-10 relative">
        <div className="absolute inset-0 bg-blue-600/30 blur-3xl rounded-full" />
        <Button
          onClick={() => navigate(PATHS.LEARNING_PLAN)}
          className={cn(
            "relative w-full h-16 rounded-full text-xl font-bold tracking-wide transition-all active:scale-[0.98]",
            "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white shadow-2xl hover:brightness-110"
          )}
        >
          Upgrade Now
        </Button>
      </footer>
    </div>
      </div>

  );
}

// ── Skeleton Loader ──
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-12 bg-[#f4f6ff] dark:bg-[#0b081e] min-h-screen flex flex-col items-center transition-colors duration-300">
      <Skeleton className="h-10 w-48 bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-6 w-full max-w-xl">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}