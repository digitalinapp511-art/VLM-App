import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  CheckCircle2, Ticket, Star, Coins, 
 GraduationCap, ArrowRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

export default function Coupon() {
  const navigate = useNavigate();
  const planId = sessionStorage.getItem("vlm_selected_plan_id");
  const { data } = useQuery({
    queryKey: ["orderSummary", planId],
    queryFn: () => studentApi.getOrderSummary(planId!),
    enabled: !!planId,
  });

  return (
    <div className={`${bgCss}relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-4 overflow-x-hidden pb-10`}>
      <div className="max-w-xl">

      {/* ── BACKGROUND DECOR (Floating Elements) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-blue-900/20 blur-[120px]" />
         <Coins className="absolute top-[15%] left-[5%] text-yellow-500 h-6 w-6 rotate-12 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
         <Coins className="absolute top-[25%] right-[8%] text-yellow-500 h-8 w-8 -rotate-12 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
         <Star className="absolute top-[20%] right-[5%] text-purple-500 h-5 w-5 fill-current opacity-60" />
         <GraduationCap className="absolute top-[5%] right-[10%] text-white/5 h-10 w-10 rotate-12" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-10 text-center   mb-2">
        <h1 className="text-2xl font-serif   tracking-[0.15em] uppercase text-white/90">
            VLM Academy
        </h1>
      </header>

      {/* ── TOP ILLUSTRATION (Rings & Check) ── */}
      <div className="relative mb-2 animate-in zoom-in duration-700">
         <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
            {/* Outer Cyan Ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-cyan-500/20" />
            <div className="absolute inset-3 rounded-full border-[1.5px] border-cyan-500/10" />
            
            {/* Inner Circle with Check */}
            <div className="relative z-10 h-14 w-14 bg-gradient-to-br from-cyan-900/40 to-black border-2 border-cyan-500/40 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.2)]">
               <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin duration-[3s]" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-cyan-400 rounded-full p-1 shadow-[0_0_15px_rgba(34,211,238,0.6)] translate-x-10 translate-y-6">
                     <CheckCircle2 size={24} className="text-black fill-current" strokeWidth={3} />
                  </div>
               </div>
            </div>
            {/* Bottom Star */}
            <Star size={24} className="absolute -bottom-2 text-cyan-400 fill-current drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
         </div>
      </div>

      {/* ── TITLE ── */}
      <div className="relative z-10 text-center space-y-0 mb-2">
        <h2 className="text-xl font-black tracking-tight text-white uppercase">
          Coupon Applied
        </h2>
        <p className="text-xs text-white/40 font-medium max-w-[220px] mx-auto leading-relaxed">
          Congratulations! You've unlocked a special discount.
        </p>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="w-full max-w-md space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* DISCOUNT AMOUNT CARD */}
        <Card className=" border-1 border-cyan-500/50 bg-white/[0.03] backdrop-blur-3xl rounded-sm overflow-hidden">
          <CardContent className="px-8 space-y-6 flex flex-col items-center">
            <p className="text-xs font-black tracking-widest text-white/80 uppercase">Discount Amount</p>
            
            <div className="w-full bg-black/40 rounded-md border border-white/5 p-6 gap-5 flex items-center justify-between">
               {/* Coupon Ticket Badge */}
               <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-purple-500/50 bg-purple-500/10">
                  <Ticket size={20} className="text-purple-400 rotate-45" />
                  <span className="text-lg font-black text-white">₹{data?.discountAmount}</span>
               </div>

               <div className="text-right">
                  <p className="text-[10px]   text-white/30 uppercase tracking-wider mb-1">Discount Applied</p>
                  <h3 className="text-2xl font-black text-white tracking-tighter leading-none">
                    ₹{data?.discountApplied}
                  </h3>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* ORDER SUMMARY CARD */}
        <Card className="border-1 border-white/10 bg-white/[0.03] backdrop-blur-3xl rounded-md overflow-hidden">
          <CardContent className="px-6 space-y-6">
            <h3 className="text-sm font-black tracking-widest text-white/80 uppercase text-center">Order Summary</h3>
            
            <div className="space-y-4">
               <SummaryRow label="Subtotal:" value={`₹${data?.subtotal}`} />
               <SummaryRow label="Discount (15%):" value={`-₹${data?.discountAmount}`} valueClass="text-cyan-400" />
               <SummaryRow label="Shipping/Fees:" value="Free" valueClass="text-green-500" />
               
               <Separator className="bg-white/10" />
               
               <div className="flex items-center justify-between pt-2">
                  <span className="text-sm   text-white uppercase tracking-tight">Updated Total</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs   text-white/60">TOTAL:</span>
                    <span className="text-xl font-black text-white">₹{data?.total}</span>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* ── PROCEED BUTTON ── */}
        <div className="relative pt-2">
            <div className="absolute inset-x-0 bottom-0 top-6 bg-blue-600/30 blur-3xl rounded-full" />
            <Button
              onClick={() => navigate(PATHS.PLAN_SCREEN)}
              className="relative w-full h-12 rounded-full bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white font-black tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              PROCEED TO PAY <ArrowRight size={20} className="ml-2" />
            </Button>
        </div>

      </main>
    </div>
      </div>

  );
}

// ── Internal Row Component ──
function SummaryRow({ label, value, valueClass }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
       <span className="text-white/40 font-medium">{label}</span>
       <span className={cn("  text-white", valueClass)}>{value}</span>
    </div>
  );
}