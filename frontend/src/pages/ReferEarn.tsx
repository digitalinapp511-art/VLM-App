import { useState } from "react";
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
    <div className={cn("relative flex min-h-svh px-3 flex-col items-center pt-4 overflow-x-hidden text-white pb-5", bgCss)}>
      <div className="max-w-xl">

      {/* ── BACKGROUND GLOWS ── */}
      <div className="absolute top-[10%] left-[-20%] h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[120px]" />
      <div className="absolute bottom-[10%]  h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: desc,
          url: link,
        });
      } catch (err) {
        console.error("Failed to share link", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className={cn(
      "border-2 bg-transparent backdrop-blur-2xl rounded-2xl overflow-hidden transition-all duration-300",
      isCyan 
        ? "border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.05)]" 
        : "border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.05)]"
    )}>
      <CardContent className="p-4 sm:p-6 space-y-3">
        
        {/* Header Info */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className={cn(
            "h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-2xl flex items-center justify-center border-2",
            isCyan ? "border-cyan-400 text-cyan-400 bg-cyan-400/5" : "border-purple-500 text-purple-500 bg-purple-500/5"
          )}>
            {icon}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">{title}</h2>
            <p className="text-[10px] sm:text-xs text-white/40 font-medium">{desc}</p>
          </div>
        </div>

        {/* Reward Points Badge */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-[9px] font-black text-yellow-400">
            ★
          </div>
          <p className="text-xs sm:text-sm font-black tracking-wide text-white">
            {points} PTS <span className="text-white/40 font-bold uppercase text-[9px] tracking-widest sm:text-[10px] ml-1">per referral!</span>
          </p>
        </div>

        {/* Referral Link Input */}
        <div className="relative">
          <Input 
            value={link} 
            readOnly 
            className="h-10 sm:h-12 rounded-xl border-white/5 bg-white/5 px-4 text-xs sm:text-sm text-white/60 focus-visible:ring-0"
          />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/80 to-transparent pointer-events-none rounded-r-xl" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Copy Link Button */}
          <Button 
            onClick={handleCopy}
            className={cn(
              "h-10 sm:h-12 rounded-full text-xs sm:text-sm font-semibold tracking-wider transition-all active:scale-95",
              isCyan 
                ? "bg-gradient-to-b from-[#1e3a8e] text-white to-[#0f172a] border border-blue-400/40" 
                : "bg-gradient-to-b from-[#7e22ce] to-[#3b0764] border border-purple-400/40"
            )}
          >
            <Copy size={14} className="mr-1.5" /> {copied ? "Copied!" : "Copy Link"}
          </Button>

          {/* Share Button (Outline with Glow) */}
          <Button 
            onClick={handleShare}
            variant="outline" 
            className={cn(
              "h-10 sm:h-12 rounded-full border border-white/10 bg-transparent text-white text-xs sm:text-sm font-semibold tracking-wider transition-all",
              isCyan ? "border-cyan-500/50 text-white hover:bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.15)]" : "border-purple-500/50 text-white hover:bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            )}
          >
            <Share2 size={14} className="mr-1.5" /> Share
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}