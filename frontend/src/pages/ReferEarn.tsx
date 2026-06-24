import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Copy, Share2, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

const fetchReferralData = async () => {
  try {
    return await studentApi.getReferralData();
  } catch {
    return {
      studentRef: "vlm.academy/ref/STU-••••",
      teacherRef: "vlm.academy/ref/TCH-••••",
      studentPoints: 100,
      teacherPoints: 500,
    };
  }
};

export default function ReferEarn() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["referralData"],
    queryFn: fetchReferralData,
  });

  return (
    <div className={`${bgCss}relative flex min-h-svh  px-3 flex-col items-center bg-[#050505]  pt-4 overflow-x-hidden text-white pb-5`}>
      <div className="max-w-xl">

      {/* ── BACKGROUND GLOWS ── */}
      <div className="absolute top-[10%] left-[-20%] h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[120px]" />
      <div className="absolute bottom-[10%]  h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />

      {/* ── HEADER ── */}
      <header className="relative z-10 flex w-full items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}>
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Refer & Earn</h1>
        <Link to={PATHS.REFERRAL_HISTORY} className="text-xs font-bold text-cyan-400 tracking-widest">
          HISTORY
        </Link>
      </header>

      <main className="w-full max-w-xl space-y-6 animate-in fade-in px-3 slide-in-from-bottom-4 duration-700">
        
        {/* ── REFER STUDENTS CARD (CYAN THEME) ── */}
        <ReferCard 
          title="Refer Students"
          desc="Help friends find advanced learning."
          points={data?.studentPoints || 0}
          link={data?.studentRef || ""}
          theme="cyan"
          icon={<Users size={32} />}
        />

        {/* ── REFER TEACHERS CARD (PURPLE THEME) ── */}
        <ReferCard 
          title="Refer Teachers"
          desc="Invite great educators to VLM Academy."
          points={data?.teacherPoints || 0}
          link={data?.teacherRef || ""}
          theme="purple"
          icon={<MessageSquare size={32} />}
        />

      </main>
    </div>
      </div>

  );
}

// ── Internal Component for Refer Cards ──
function ReferCard({ title, desc, points, link, theme, icon }: any) {
  const isCyan = theme === "cyan";

  return (
    <Card className={cn(
      "border-2 bg-transparent backdrop-blur-2xl rounded-lg overflow-hidden transition-all duration-300",
      isCyan 
        ? "border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.05)]" 
        : "border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.05)]"
    )}>
      <CardContent className="px-8  space-y-3">
        
        {/* Header Info */}
        <div className="flex items-center gap-5">
          <div className={cn(
            "h-20 w-20 shrink-0 rounded-3xl flex items-center justify-center border-2",
            isCyan ? "border-cyan-400 text-cyan-400 bg-cyan-400/5" : "border-purple-500 text-purple-500 bg-purple-500/5"
          )}>
            {icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            <p className="text-xs text-white/40 font-medium">{desc}</p>
          </div>
        </div>

        {/* Reward Points Badge */}
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#f5a623] flex items-center justify-center text-[8px] font-black text-black">VLM</div>
                <p className="text-base font-black text-white">{points} PTS per referral!</p>
            </div>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest ml-8">Reward Points</p>
        </div>

        {/* Referral Link Input */}
        <div className="relative">
          <Input 
            value={link} 
            readOnly 
            className="h-14 rounded-2xl border-white/5 bg-white/5 px-6 text-sm text-white/60 focus-visible:ring-0"
          />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#1a1a1a] to-transparent pointer-events-none rounded-r-2xl" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {/* Copy Link Button */}
          <Button className={cn(
            "h-14 rounded-full text-sm font-white tracking-widest shadow-xl transition-all active:scale-95",
            isCyan 
                ? "bg-gradient-to-b from-[#1e3a8e] text-white to-[#0f172a] border border-blue-400/40" 
                : "bg-gradient-to-b from-[#7e22ce] to-[#3b0764] border border-purple-400/40"
          )}>
            <Copy size={18} className="mr-2" /> Copy Link
          </Button>

          {/* Share Button (Outline with Glow) */}
          <Button variant="outline" className={cn(
            "h-14 rounded-full border-2  bg-transparent text-white  tracking-widest transition-all",
            isCyan ? "border-cyan-500/50 text-white hover:bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-purple-500/50 text-white hover:bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          )}>
            <Share2 size={18} className="mr-2" /> Share
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}