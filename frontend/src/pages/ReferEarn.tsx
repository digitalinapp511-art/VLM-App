import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Copy, Share2, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentProfile } from "@/hooks/use-student";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { studentApi } from "@/lib/student-api";

const fetchReferralData = async () => {
  try {
    return await studentApi.getReferralData();
  } catch {
    return {
      studentPoints: 500,
      teacherPoints: 1000,
    };
  }
};

export default function ReferEarn() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["referralData"],
    queryFn: fetchReferralData,
  });

  const { data: profile } = useStudentProfile();
  const student = (profile as any)?.data || profile;
  const vlmStudentId = student?.vlmStudentId || "STU-XXXX";
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  // Share link using student ID
  const studentReferralLink = `${window.location.origin}?ref=${vlmStudentId}`;
  const teacherReferralLink = `${window.location.origin}?ref=${vlmStudentId}&role=teacher`;

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl w-full flex flex-col min-h-svh pb-24">

        <header className="relative z-10 flex w-full items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-md font-black tracking-tight uppercase">Refer & Earn</h1>
          <Link to={PATHS.REFERRAL_HISTORY} className="text-xs font-black text-violet-600 dark:text-violet-400 tracking-wider">
            HISTORY
          </Link>
        </header>

        <main className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Promo Title */}
          <div className="text-center space-y-1 mb-1">
            <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Invite & Get Rewards</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
              Share your unique link with friends or teachers and earn coins when they start learning.
            </p>
          </div>

          {/* Custom Tabs to toggle side-by-side without scroll */}
          <div className="flex border border-slate-200 dark:border-[#221c4e] rounded-xl p-1 bg-slate-50/50 dark:bg-slate-900/40">
            <button
              onClick={() => setActiveTab("student")}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                activeTab === "student"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              Refer Students
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                activeTab === "teacher"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              )}
            >
              Refer Teachers
            </button>
          </div>

          {/* ── REFER STUDENTS CARD (CYAN THEME) ── */}
          {activeTab === "student" && (
            <ReferCard 
              title="Refer Students"
              desc="Share VLM Academy with other students."
              points={data?.studentPoints || 500}
              link={studentReferralLink}
              theme="cyan"
              icon={<Users size={24} />}
            />
          )}

          {/* ── REFER TEACHERS CARD (PURPLE THEME) ── */}
          {activeTab === "teacher" && (
            <ReferCard 
              title="Refer Teachers"
              desc="Invite educators to teach on VLM."
              points={data?.teacherPoints || 1000}
              link={teacherReferralLink}
              theme="purple"
              icon={<MessageSquare size={24} />}
            />
          )}
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
      "border bg-white dark:bg-[#161233] rounded-[2rem] overflow-hidden transition-all duration-300 shadow-sm",
      isCyan 
        ? "border-slate-100 dark:border-[#221c4e] hover:border-cyan-500/40" 
        : "border-slate-100 dark:border-[#221c4e] hover:border-purple-500/40"
    )}>
      <CardContent className="p-5 sm:p-6 space-y-4">
        
        {/* Header Info */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border",
            isCyan 
              ? "border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500" 
              : "border-purple-200 bg-purple-50 dark:bg-purple-950/20 text-purple-500"
          )}>
            {icon}
          </div>
          <div className="space-y-0.5 text-left">
            <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{desc}</p>
          </div>
        </div>

        {/* Reward Points Badge */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="h-5 w-5 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-[10px] font-black text-yellow-400">
            ★
          </div>
          <p className="text-xs font-black tracking-wide text-slate-800 dark:text-white">
            {points} PTS <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-widest ml-1">per referral!</span>
          </p>
        </div>

        {/* Referral Link Input */}
        <div className="relative">
          <Input 
            value={link} 
            readOnly 
            className="h-11 rounded-xl border-slate-200 dark:border-[#221c4e] bg-slate-50/50 dark:bg-slate-900/40 px-4 text-xs font-black text-slate-500 dark:text-slate-400 focus-visible:ring-0"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Copy Link Button */}
          <Button 
            onClick={handleCopy}
            className={cn(
              "h-11 rounded-xl text-xs font-black tracking-wider transition-all active:scale-95 text-white border-none",
              isCyan 
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" 
                : "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400"
            )}
          >
            <Copy size={14} className="mr-1.5" /> {copied ? "Copied!" : "Copy Link"}
          </Button>

          {/* Share Button (Outline with Glow) */}
          <Button 
            onClick={handleShare}
            variant="outline" 
            className="h-11 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 text-xs font-black tracking-wider hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all"
          >
            <Share2 size={14} className="mr-1.5" /> Share
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}