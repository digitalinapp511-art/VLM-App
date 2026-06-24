import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
 Calendar, CheckCircle2, 
  BookOpen, Layout, Activity, UserCheck, Star, 
  GraduationCap 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { bgCss } from "@/helper/CssHelper";

import { useMySubscription } from "@/hooks/use-student";

export default function PlanScreen() {
  const navigate = useNavigate();
  const { data: sub } = useMySubscription();

  const data = sub ? {
    planName: sub.plan?.name ?? "Active Plan",
    duration: sub.plan?.duration ?? "3 Days",
    startDate: new Date(sub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    endDate: new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    autoPayAmount: `₹${sub.plan?.price ?? 0}/mo`,
  } : null;

  return (
    <div className={`${bgCss}relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6  overflow-x-hidden pb-10`}>
      <div className="max-w-xl">

      {/* ── BACKGROUND DECOR ── */}
      <Star className="absolute top-10 left-10 text-white/20 h-4 w-4" />
      <Star className="absolute top-1/2 right-5 text-purple-500/40 h-5 w-5 fill-current" />
      <div className="absolute top-[20%] left-[-10%] h-64 w-64 bg-cyan-500/10 blur-[100px]" />

      {/* ── TOP ILLUSTRATION ── */}
      <div className="relative  animate-in zoom-in duration-700">
         {/* Custom Graphic Implementation */}
         <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
            <div className="relative z-10 p-2 bg-[#1a1a1a] border-4 border-[#333] rounded-full shadow-2xl">
               <GraduationCap size={42} className="text-blue-500" strokeWidth={1.5} />
               <div className="absolute -top-2 -left-2 bg-green-500 rounded-full p-1 border-4 border-[#050505]">
                  <CheckCircle2 size={16} className="text-white fill-current" />
               </div>
               <Badge className="absolute -bottom-2 -right-4 bg-cyan-400 text-black font-black text-[9px] tracking-widest px-2 py-0.5 rounded-md border-none">
                  TRIAL
               </Badge>
            </div>
            <Star className="absolute top-0 -right-6 text-yellow-500 fill-current h-8 w-8 opacity-60" />
            <div className="absolute bottom-4 -left-10 h-3 w-3 rounded-full bg-yellow-500/40" />
         </div>
      </div>

      {/* ── MAIN HEADING ── */}
      <h1 className="text-lg text-center   tracking-tight text-white mb-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
        Your 3-Day Trial is Active
      </h1>

      {/* ── TRIAL INFO CARD ── */}
      <Card className="w-full max-w-md border-1 border-cyan-500/80 bg-white/[0.03] backdrop-blur-3xl rounded-lg shadow-[0_0_40px_rgba(34,211,238,0.05)] overflow-hidden">
        <CardContent className="p-8 py-2 space-y-3">
          
          {/* Active Plan Header */}
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-full bg-blue-900/40 border border-blue-500/20 shadow-inner flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-[#0a0f1d]" />
               </div>
               <div>
                  <p className="text-[10px]   text-white/40 uppercase tracking-[0.15em]">Active Plan:</p>
                  <h2 className="text-lg   text-white tracking-tight leading-tight">
                    {data?.planName ?? "No active plan"}
                  </h2>
               </div>
            </div>
            <CheckCircle2 size={24} className="text-green-500 fill-green-500/10" />
          </div>

          {/* Plan Details */}
          <div className="space-y-1">
             <h3 className="text-xs font-black tracking-widest text-white/90 uppercase">Plan details</h3>
             <div className="space-y-3">
                <DetailRow icon={<Calendar className="text-red-500" />} label="Trial Duration:" value={data?.duration || ""} />
                <DetailRow icon={<Calendar className="text-red-500" />} label="Trial Starts:" value={`[${data?.startDate}]`} isDate />
                <DetailRow icon={<Calendar className="text-red-500" />} label="Trial Ends:" value={`[${data?.endDate}]`} isDate />
             </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Benefits Grid */}
          <div className="space-y-2">
             <h3 className="text-xs font-black tracking-widest text-white/90 uppercase">Included Premium Benefits</h3>
             <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <BenefitItem icon={<Layout />} label="All Subject" sub="Classes" />
                <BenefitItem icon={<BookOpen />} label="Practice Mock" sub="Sets Tests" />
                <BenefitItem icon={<Activity />} label="Performance" sub="Analytics" />
                <BenefitItem icon={<UserCheck />} label="Mentor" sub="Support" />
             </div>
          </div>

        </CardContent>
      </Card>

      {/* ── FOOTER NOTE ── */}
      <p className="mt-1 text-justify text-center text-[10px] text-white/30 leading-relaxed max-w-sm">
        Note: Auto-pay will begin automatically for a full Premium subscription on 
        <span className="text-white/50"> [{data?.endDate}]</span> at {data?.autoPayAmount}, as detailed in your plan settings.
      </p>

      {/* ── GO TO DASHBOARD BUTTON ── */}
      <div className="mt-auto w-full max-w-md pt-2 relative">
        <div className="absolute inset-0 bg-blue-600/30 blur-3xl rounded-full" />
        <Button
          onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
          className={cn(
            "relative w-full h-16 rounded-full text-lg tracking-wide transition-all active:scale-[0.98]",
            "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white shadow-2xl hover:brightness-110"
          )}
        >
          Go to Dashboard
        </Button>
      </div>

    </div>
      </div>

  );
}

// ── Internal Detail Row Component ──
function DetailRow({ icon, label, value, isDate }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className="h-6 w-6 flex items-center justify-center opacity-70">{icon}</div>
       <p className="text-sm font-medium">
          <span className="text-white/40 mr-2">{label}</span>
          <span className={cn("text-white  ", isDate && "text-white/90")}>{value}</span>
       </p>
    </div>
  );
}

// ── Internal Benefit Item Component ──
function BenefitItem({ icon, label, sub }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className="h-10 w-10 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          {icon}
       </div>
       <div className="flex flex-col">
          <span className="text-[11px]   text-white/80 leading-none">{label}</span>
          <span className="text-[11px]   text-white/80 leading-none mt-1">{sub}</span>
       </div>
    </div>
  );
}