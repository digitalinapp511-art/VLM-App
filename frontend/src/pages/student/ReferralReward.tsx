import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Star, Coins, } from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { studentApi } from "@/lib/student-api";

const fetchRewardDetails = async () => {
  try {
    const stats = await studentApi.getStats();
    return {
      referredPerson: "Your Network",
      pointsEarned: stats.rewardPoints ?? 0,
      waitlistBonus: 50,
      heroTierBonus: 10,
      totalUpdated: (stats.rewardPoints ?? 0) + 60,
    };
  } catch {
    return { referredPerson: "Your Network", pointsEarned: 0, waitlistBonus: 50, heroTierBonus: 10, totalUpdated: 60 };
  }
};

export default function ReferralReward() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["referralReward"],
    queryFn: fetchRewardDetails,
  });

  return (
    <div className="relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-5 overflow-x-hidden pb-10">
      <div className="max-w-xl">

      {/* ── TOP ILLUSTRATION ── */}
      <div className="relative mb-0 animate-in zoom-in duration-700">
         <div className="h-20 m-auto w-20 rounded-full bg-cyan-900/20 flex items-center justify-center border border-white/5 relative shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <Star size={40} className="text-[#f5a623] fill-[#f5a623] drop-shadow-[0_0_15px_rgba(245,166,35,0.6)]" />
         </div>
      </div>

      {/* ── MAIN HEADING ── */}
      <h2 className="text-xl  tracking-tight text-white mb-4 text-center animate-in fade-in slide-in-from-top-2 duration-700">
        Referral Reward Added
      </h2>

      {/* ── CONTENT AREA ── */}
      <main className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* CARD 1: REFERRED TYPE & POINTS */}
        <Card className="border-white/10 bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
          <CardContent className="p-6 py-0 min-w-xs flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-xs font-medium text-white/30 tracking-tight">Referred Type:</p>
               <h3 className=" font-bold text-white tracking-tight">
                 {data?.referredPerson || "Loading..."}
               </h3>
            </div>

            <div className="text-right space-y-2">
               <div className="flex flex-col items-end gap-1">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Points Earned:</p>
                  <div className="flex items-center gap-1.5 text-[#f5a623] drop-shadow-[0_0_8px_rgba(245,166,35,0.3)]">
                     <Coins size={18} />
                     <Coins size={14} className="-ml-2 opacity-80" />
                  </div>
               </div>
               <h3 className="text-xl font-black text-[#f5a623] tracking-tighter leading-none">
                 {data?.pointsEarned}
               </h3>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: BALANCE SUMMARY */}
        <Card className="border-white/10 bg-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="px-6 py-2 space-y-6">
            <h3 className="text-base font-bold text-white tracking-tight">Updated Balance Summary</h3>
            
            <div className="space-y-4">
               <SummaryRow label="Referred Person:" value={`${data?.pointsEarned} Pts`} />
               <SummaryRow label="Waitlist Bonus:" value={`${data?.waitlistBonus} Pts`} />
               <SummaryRow 
                  label="Referral Hero Tier:" 
                  value={`+${data?.heroTierBonus} Pts`} 
                  valueClass="text-cyan-400" 
               />
            </div>
          </CardContent>
        </Card>

      </main>

      {/* ── FOOTER ACTION ── */}
      <div className="mt-auto w-full max-w-md pt-3 relative">
        <div className="absolute inset-0 bg-blue-600/30 blur-3xl rounded-full" />
        <Button
          onClick={() => navigate(PATHS.REFER_EARN)}
          className={cn(
            "relative w-full h-16 rounded-full text-lg font-black tracking-widest transition-all active:scale-[0.98]",
            "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white shadow-2xl hover:brightness-110"
          )}
        >
          SHARE MORE
        </Button>
      </div>

    </div>
      </div>

  );
}

// ── Internal Row Component ──
function SummaryRow({ label, value, valueClass }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm font-medium">
       <span className="text-white/60">{label}</span>
       <span className={cn("text-white font-bold", valueClass)}>{value}</span>
    </div>
  );
}