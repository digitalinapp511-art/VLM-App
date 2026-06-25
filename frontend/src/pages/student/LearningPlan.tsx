import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Lightbulb, MessageCircle, Headphones, Video, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlans, useActivateTrial, useStudentProfile } from "@/hooks/use-student";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";

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

// ── Fallback plans when API returns nothing ───────────────
const FALLBACK_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "₹199",
    oldPrice: "₹399",
    credits: 50,
    humanChatCredits: 2,
    audioVideoMinutes: 30,
    liveClassAcess: 1,
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "₹499",
    oldPrice: "₹999",
    credits: 150,
    humanChatCredits: 10,
    audioVideoMinutes: 120,
    liveClassAcess: 5,
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "₹999",
    oldPrice: "₹1999",
    credits: 500,
    humanChatCredits: 30,
    audioVideoMinutes: 300,
    liveClassAcess: 20,
  },
];

function mapFeatures(plan: any) {
  return [
    { icon: Lightbulb, text: `${plan.credits ?? "100"} AI Credits` },
    { icon: MessageCircle, text: `${plan.humanChatCredits ?? "5"} Human Chat Credits` },
    { icon: Headphones, text: `${plan.audioVideoMinutes ?? "60"} Audio / Video Minutes` },
    { icon: Video, text: `${plan.liveClassAcess ?? "1"} Live Class Access` },
  ];
}

export default function LearningPlan() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const studentClass = (profile as any)?.class || (profile as any)?.className || "10";
  const { data: apiPlans, isLoading } = usePlans(studentClass);
  const activateTrial = useActivateTrial();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // Use API plans if available, else show fallback
  const rawPlans = (apiPlans && apiPlans.length > 0) ? apiPlans : FALLBACK_PLANS;

  const plans = rawPlans.map((p: any, i: number) => {
    const style = PLAN_STYLES[p.name] ?? DEFAULT_STYLE;
    return {
      id: p.id,
      name: p.name,
      recommended: i === 1, // middle plan recommended (Pro)
      oldPrice: p.oldPrice ?? `₹${Math.round((p.price ?? 499) * 2)}`,
      price: p.price ?? `₹${p.price}`,
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

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-4 pb-44 overflow-x-hidden">

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

      {/* ── Plans list (vertical stack, matches Figma) ── */}
      <div className="flex flex-col gap-5 mt-8 w-full max-w-md">
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
                  <Badge className="bg-yellow-300 text-black font-black text-[10px] tracking-widest px-4 py-1 rounded-full border-none shadow-[0_0_16px_rgba(253,224,71,0.5)]">
                    RECOMMENDED
                  </Badge>
                </div>
              )}

              <div className="p-6 pt-8 space-y-4">
                {/* Plan name + price + selector */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-white">{plan.name}</h2>
                    <p className="text-xs text-white/30 line-through">{plan.oldPrice}/mo</p>
                    <p className={cn("text-2xl font-black tracking-tight", plan.color)}>
                      {plan.price}
                      <span className="text-sm font-medium text-white/40">/mo</span>
                    </p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all",
                    isActive ? "border-transparent" : "border-white/20"
                  )}>
                    {isActive && (
                      <CheckCircle2 className={cn("w-6 h-6", plan.color)} />
                    )}
                  </div>
                </div>

                {/* 3-day trial badge */}
                <Badge className="bg-yellow-300 text-black font-bold text-[10px] px-3 py-1 rounded-lg border-none">
                  3 Days Free Trial
                </Badge>

                {/* Divider */}
                <div className="h-px bg-white/8" />

                {/* Features */}
                <div className="space-y-2.5">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={cn("shrink-0", plan.color)}>
                        <feat.icon size={15} strokeWidth={2} />
                      </div>
                      <p className="text-sm text-white/60">{feat.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sticky footer ── */}
      <footer className="fixed bottom-0 left-0 w-full px-4 pb-8 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col items-center gap-2 z-50">
        <p className="text-white/60 text-sm font-semibold">
          Activate trial for <span className="text-white font-bold">₹1</span>
        </p>
        <div className="w-full max-w-md relative">
          <div className="absolute inset-x-0 bottom-0 h-12 bg-blue-500/20 blur-[32px] rounded-full" />
          <Button
            onClick={handleStartTrial}
            disabled={activateTrial.isPending}
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