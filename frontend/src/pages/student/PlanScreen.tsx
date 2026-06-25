import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Lightbulb, MessageCircle, Headphones, Video, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlans, useActivateTrial, useStudentProfile } from "@/hooks/use-student";
import DashboardLoading from "@/components/basic/DashboardLoading";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Plan colour config ─────────────────────────────────────
const PLAN_STYLES: Record<string, { color: string; glow: string; ring: string; bg: string }> = {
  "Premium Plan": {
    color: "text-yellow-300",
    glow: "shadow-[0_0_28px_rgba(245,166,35,0.35)]",
    ring: "ring-yellow-400/60",
    bg: "bg-yellow-300/8",
  },
  "Pro Plan": {
    color: "text-blue-400",
    glow: "shadow-[0_0_28px_rgba(59,130,246,0.25)]",
    ring: "ring-blue-400/50",
    bg: "bg-blue-400/8",
  },
  "Basic Plan": {
    color: "text-cyan-400",
    glow: "shadow-[0_0_28px_rgba(34,211,238,0.25)]",
    ring: "ring-cyan-400/50",
    bg: "bg-cyan-400/8",
  },
};
const DEFAULT_STYLE = PLAN_STYLES["Basic Plan"];

function mapFeatures(plan: any) {
  return [
    { icon: Lightbulb, text: `${plan.credits ?? "100"} AI Credits` },
    { icon: MessageCircle, text: `${plan.humanChatCredits ?? "5"} Human Chat Credits` },
    { icon: Headphones, text: `${plan.audioVideoMinutes ?? "60"} Audio/Video Minutes` },
    { icon: Video, text: `${plan.liveClassAcess ?? "1"} Live Class Access` },
  ];
}

export default function PlanScreen() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const studentClass = (profile as any)?.class || (profile as any)?.className || "10";
  const { data: apiPlans, isLoading } = usePlans(studentClass);
  const activateTrial = useActivateTrial();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  const plans = (apiPlans ?? []).map((p: any, i: number) => {
    const style = PLAN_STYLES[p.name] ?? DEFAULT_STYLE;
    return {
      id: p.id,
      name: p.name,
      recommended: i === 0,
      oldPrice: `₹${Math.round(p.price * 2)}`,
      price: `₹${Math.round(p.price)}`,
      ...style,
      features: mapFeatures(p),
    };
  });

  const activePlanId = selectedPlanId || plans[0]?.id;

  const handleStartTrial = () => {
    const planId = activePlanId;
    if (!planId) return;
    sessionStorage.setItem("vlm_selected_plan_id", planId);
    activateTrial.mutate(planId, {
      onSuccess: () => navigate(PATHS.STUDENT_DASHBOARD),
      onError: () => navigate(PATHS.STUDENT_DASHBOARD),
    });
  };

  if (isLoading) return <DashboardLoading />;

  return (
    <div className="relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-4 pb-40 overflow-x-hidden">

      {/* ── Background glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[8%] left-[-12%] w-72 h-72 bg-blue-700/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-12%] w-72 h-72 bg-purple-900/10 blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="w-full max-w-md pt-10 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-white/70" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold tracking-tight pr-9">
          Choose Your Learning Plan
        </h1>
      </header>

      {/* ── Plans list ── */}
      <div className="flex flex-col gap-4 mt-8 w-full max-w-md">
        {plans.map((plan) => {
          const isActive = activePlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={cn(
                "relative cursor-pointer rounded-[2rem] border border-white/8 transition-all duration-300 overflow-visible",
                plan.bg,
                plan.glow,
                isActive && `ring-2 ${plan.ring}`
              )}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-yellow-300 text-black font-black text-[10px] tracking-widest px-4 py-1 rounded-full border-none">
                    RECOMMENDED
                  </Badge>
                </div>
              )}

              <div className="p-6 pt-8 space-y-5">
                {/* Plan name + price row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-white">{plan.name}</h2>
                    <p className="text-xs text-white/30 line-through">{plan.oldPrice}/mo</p>
                    <p className={cn("text-2xl font-black tracking-tight", plan.color)}>
                      {plan.price}<span className="text-sm font-medium text-white/40">/mo</span>
                    </p>
                  </div>

                  {/* Selected indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isActive ? "border-transparent" : "border-white/20"
                  )}>
                    {isActive && <CheckCircle2 className={cn("w-6 h-6", plan.color)} fill="currentColor" fillOpacity={0.15} />}
                  </div>
                </div>

                {/* 3-day trial badge */}
                <Badge className="bg-yellow-300 text-black font-bold text-[10px] px-3 py-1 rounded-lg border-none">
                  3 Days Free Trial
                </Badge>

                {/* Divider */}
                <div className="h-px bg-white/8" />

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={cn("shrink-0", plan.color)}>
                        <feat.icon size={16} strokeWidth={2} />
                      </div>
                      <p className="text-sm text-white/70">{feat.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Decorative stars ── */}
      <Star className="absolute top-14 right-8 text-white/10 h-4 w-4 fill-current" />
      <Star className="absolute top-1/3 left-4 text-purple-400/20 h-5 w-5 fill-current" />

      {/* ── Sticky footer ── */}
      <footer className="fixed bottom-0 left-0 w-full px-4 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center gap-1 z-50">
        <p className="text-white/60 text-sm font-semibold">
          Activate trial for <span className="text-white font-bold">₹1</span>
        </p>
        <div className="w-full max-w-md relative">
          <div className="absolute inset-x-0 bottom-0 h-12 bg-blue-500/20 blur-[32px] rounded-full" />
          <Button
            onClick={handleStartTrial}
            disabled={activateTrial.isPending || plans.length === 0}
            className={cn(
              "relative w-full h-14 rounded-full text-base font-bold tracking-wide transition-all active:scale-[0.98]",
              "bg-gradient-to-b from-[#1e3a8e] to-[#0f172a]",
              "border border-blue-400/40 text-white shadow-2xl hover:brightness-110",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {activateTrial.isPending ? "ACTIVATING..." : "START 3-DAY TRIAL"}
          </Button>
        </div>
      </footer>
    </div>
  );
}