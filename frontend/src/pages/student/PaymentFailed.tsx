import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
   RefreshCcw, CreditCard, Wallet, 
  Headphones, AlertCircle,  Star 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

export default function PaymentFailed() {
  const navigate = useNavigate();
  const planId = sessionStorage.getItem("vlm_selected_plan_id");

  const mutation = useMutation({
    mutationFn: () => studentApi.createPaymentOrder(planId!),
    onSuccess: () => navigate(PATHS.PLAN_SCREEN),
    onError: () => alert("Payment failed again. Please check your bank."),
  });

  return (
    <div className={`${bgCss}relative min-h-svh w-full  text-white flex flex-col items-center px-6 pt-4 overflow-x-hidden pb-2`}>
      <div className="max-w-xl flex flex-col justif-center items-center">

      {/* ── BACKGROUND DECOR ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-red-900/10 blur-[120px] pointer-events-none" />
      <Star className="absolute top-10 left-6 text-blue-500/20 h-4 w-4" />
      <Star className="absolute top-40 right-6 text-purple-500/30 h-5 w-5 fill-current" />

      {/* ── HEADER ── */}
      <header className="relative z-10 text-center mb-5">
        <h1 className="text-2xl font-serif font-bold tracking-[0.2em] uppercase">VLM Academy</h1>
      </header>

      {/* ── ERROR ILLUSTRATION ── */}
      <div className="relative mb-2 animate-in zoom-in duration-500">
         <div className="h-32 w-32 bg-red-500/10 border-2 border-red-500/20 rounded-[2rem] flex items-center justify-center relative shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="h-16 w-20 bg-blue-900/40 rounded-xl border border-blue-500/30 flex flex-col items-center justify-center gap-1">
               <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
               <div className="h-8 w-12 border-2 border-blue-400/40 rounded-md" />
            </div>
            {/* Red Alert Badge */}
            <div className="absolute bottom-6 right-6 bg-red-500 rounded-full p-1 border-4 border-[#050505] animate-pulse">
               <AlertCircle size={20} className="text-white fill-current text-red-500" />
            </div>
         </div>
      </div>

      {/* ── MAIN HEADING ── */}
      <div className="text-center space-y-2 mb-2">
        <h2 className="text-xl font-bold leading-tight tracking-tight px-4">
          Payment Could Not <br /> Be Processed
        </h2>
      </div>

      {/* ── ACTION CARDS LIST ── */}
      <main className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Retry Payment */}
        <ActionCard 
          icon={<RefreshCcw className={cn(mutation.isPending && "animate-spin")} />} 
          title="Retry Payment" 
          desc="Instant retry using current method" 
          theme="cyan"
          onClick={() => planId ? mutation.mutate() : navigate(PATHS.LEARNING_PLAN)}
          disabled={mutation.isPending}
        />

        {/* Update Payment Method */}
        <ActionCard 
          icon={<CreditCard />} 
          title="Update Payment Method" 
          desc="Add new card, UPI, net banking" 
          theme="blue"
        />

        {/* Wallet Recharge */}
        <ActionCard 
          icon={<Wallet />} 
          title="Wallet Recharge" 
          desc="Add funds to your secure wallet" 
          theme="gold"
        />

        {/* Support */}
        <ActionCard 
          icon={<Headphones />} 
          title="Support Contact Button" 
          desc="Connect with our team for help" 
          theme="green"
        />

      </main>

      {/* ── FOOTER BUTTONS ── */}
      <footer className="mt-auto w-full max-w-md space-y-4 pt-3">
        
        {/* Continue to Dashboard (Neon Outline) */}
        <Button
          variant="outline"
          onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
          className="w-full h-16 rounded-full border-2 border-cyan-500/50 bg-transparent text-white font-bold text-lg tracking-tight hover:bg-cyan-500/5 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] active:scale-95"
        >
          Continue to Dashboard
        </Button>

        {/* Need Help (Blue Gradient Glow) */}
        <div className="relative group">
           <div className="absolute inset-0 bg-blue-600/30 blur-2xl rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />
           <Button className="relative w-full h-16 rounded-full bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white font-bold text-lg tracking-tight shadow-xl">
              Need Help?
           </Button>
        </div>

      </footer>
    </div>
      </div>

  );
}

// ── Internal Action Card Component ──
function ActionCard({ icon, title, desc, theme, onClick, disabled }: any) {
  const themeStyles = {
    cyan: "border-cyan-500/30 text-cyan-400 bg-cyan-400/5",
    blue: "border-blue-500/30 text-blue-500 bg-blue-500/5",
    gold: "border-yellow-500/30 text-yellow-500 bg-yellow-500/5",
    green: "border-green-500/30 text-green-500 bg-green-500/5",
  };

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "bg-white/[0.03] border-white/5 backdrop-blur-xl rounded-md cursor-pointer transition-all active:scale-[0.98] hover:bg-white/[0.06]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <CardContent className="p-0 px-5 flex items-center gap-5">
        <div className={cn(
          "h-14 w-14 shrink-0 rounded-md border-2 flex items-center justify-center transition-all",
          themeStyles[theme as keyof typeof themeStyles]
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-white/30 font-medium">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}