import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Award, CheckCircle, CreditCard, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentProfile } from "@/hooks/use-student";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { GoldCoinsIcon } from "@/components/basic/GoldCoinsIcon";

export default function UseSubscription() {
  const navigate = useNavigate();
  const { data: profile, refetch } = useStudentProfile();
  const p = (profile as any)?.data ?? profile;

  const [points, setPoints] = useState(p?.totalPoints ?? p?.wallet?.totalPoints ?? 100);
  const [redeemedPlan, setRedeemedPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      pointsCost: 500,
      description: "Unlock basic tutoring tools & 50 AI Credits",
      color: "from-cyan-500/20 to-blue-500/5",
      borderColor: "border-cyan-500/25",
      textColor: "text-cyan-400"
    },
    {
      id: "pro",
      name: "Pro Plan",
      pointsCost: 1000,
      description: "Unlock pro features, 100 AI Credits & 5 Live chats",
      color: "from-blue-500/20 to-indigo-500/5",
      borderColor: "border-blue-500/25",
      textColor: "text-blue-400",
      popular: true
    },
    {
      id: "premium",
      name: "Premium Plan",
      pointsCost: 2000,
      description: "Unlock unlimited tools, 250 AI Credits & video calls",
      color: "from-yellow-500/20 to-orange-500/5",
      borderColor: "border-yellow-500/25",
      textColor: "text-yellow-400"
    }
  ];

  const handleRedeem = (planName: string, cost: number) => {
    if (points < cost) {
      setErrorMsg(`You need ${cost - points} more PTS to unlock this plan! Complete MCQs or spin the wheel to earn more.`);
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }
    setPoints((prev: any) => prev - cost);
    setRedeemedPlan(planName);
  };

  return (
    <div className={cn("min-h-svh w-full text-white flex flex-col px-6 pb-20 overflow-x-hidden relative", bgCss)}>
      
      {/* Background Decor */}
      <div className="absolute top-[8%] left-[-10%] h-64 w-64 bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-64 w-64 bg-cyan-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between pt-8 pb-1 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white shrink-0 active:scale-95 transition-all" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </Button>
          
          <h1 className="text-sm font-black tracking-widest text-white/90 uppercase">
            Redeem Subscription
          </h1>
          <div className="w-10" />
        </header>

        {/* ── WALLET POINTS BALANCE DISPLAY ── */}
        <Card className="border border-purple-500/20 bg-[#1a1a1a]/40 backdrop-blur-xl rounded-[2rem] p-6 text-center">
          <span className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase block">
            AVAILABLE REDEMPTION BALANCE
          </span>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-3xl font-black text-white font-sans tracking-tight">
              {points.toLocaleString()}
            </span>
            <span className="text-xs font-black text-white/70 tracking-widest mt-1.5 uppercase">
              PTS
            </span>
            <GoldCoinsIcon size={18} className="mt-0.5" />
          </div>
        </Card>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in duration-300">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-red-300 leading-snug text-left">{errorMsg}</p>
          </div>
        )}

        {/* ── PLANS LIST ── */}
        <main className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={cn(
                "relative border bg-gradient-to-br rounded-[2.2rem] overflow-hidden p-6 transition-all hover:bg-white/[0.02]",
                plan.borderColor,
                plan.color
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase">
                  RECOMMENDED
                </div>
              )}
              
              <CardContent className="p-0 flex flex-col gap-4 text-left">
                <div>
                  <h3 className={cn("text-lg font-bold tracking-wide", plan.textColor)}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-white/50 mt-1 leading-snug">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5">
                    <GoldCoinsIcon size={14} />
                    <span className="text-sm font-black text-white">
                      {plan.pointsCost.toLocaleString()} PTS
                    </span>
                  </div>

                  <Button
                    onClick={() => handleRedeem(plan.name, plan.pointsCost)}
                    className={cn(
                      "h-10 px-5 rounded-full font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md",
                      points >= plan.pointsCost
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-neutral-800 text-white/30 border border-white/5 cursor-not-allowed hover:bg-neutral-800"
                    )}
                  >
                    Redeem Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>

      {/* ── REDEMPTION SUCCESS DIALOG ── */}
      {redeemedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg p-6">
          <div className="relative w-full max-w-xs rounded-[2.5rem] border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-8 text-center shadow-[0_0_40px_rgba(34,211,238,0.15)] flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400 border border-cyan-500/20 text-2xl shadow-inner">
              <CheckCircle size={32} className="text-cyan-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white leading-snug">
                Redemption Successful!
              </h3>
              <p className="text-xs text-white/55 leading-snug">
                You have successfully redeemed the <strong className="text-cyan-400">{redeemedPlan}</strong> using your reward points.
              </p>
            </div>

            <Button
              onClick={() => {
                setRedeemedPlan(null);
                refetch(); // sync points back from server cache
                navigate(PATHS.STUDENT_DASHBOARD);
              }}
              className="w-full h-12 rounded-full font-bold text-sm bg-cyan-400 text-black hover:bg-cyan-300 transition-all uppercase tracking-wider"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
