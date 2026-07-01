import { bgCss } from "@/helper/CssHelper";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import HorizontalSection from "@/components/basic/student/HorizontalSection";
import DashboardLoading from "@/components/basic/DashboardLoading";
import FeatureCard from "@/components/basic/student/FeatureCard";
import {
  Bell, GraduationCap, MessageSquare, Bot, Users,
  ClipboardCheck, Trophy, Coins, Clock, BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStudentProfile } from "@/hooks/use-student";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

// Shadcn Components
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GoldCoinsIcon } from "@/components/basic/GoldCoinsIcon";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useStudentProfile();

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/student/dashboard");
      return res.data;
    }
  });

  const p = (profile as any)?.data ?? profile;
  const [secondsLeft, setSecondsLeft] = useState(0);

  const lastSpinDateStr = profile?.lastSpinDate ?? dashboard?.data?.student?.lastSpinDate;

  useEffect(() => {
    if (profileError) {
      const err = profileError as any;
      if (err?.response?.status === 404) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
        return;
      }
    }

    if (profile && !isProfileLoading) {
      const isIncomplete =
        !p?.fullName ||
        !(p?.className || p?.class) ||
        !p?.board ||
        !p?.nickname;
      if (isIncomplete) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
      }
    }
  }, [profile, isProfileLoading, profileError, navigate, p]);

  // Sync Timer countdown
  useEffect(() => {
    if (lastSpinDateStr) {
      const updateTimer = () => {
        const lastSpin = new Date(lastSpinDateStr).getTime();
        const diffMs = Date.now() - lastSpin;
        const remainingMs = (24 * 3600 * 1000) - diffMs;
        if (remainingMs > 0) {
          setSecondsLeft(Math.ceil(remainingMs / 1000));
        } else {
          setSecondsLeft(0);
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [lastSpinDateStr]);

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLoading = isProfileLoading || isDashboardLoading;

  if (isLoading && !dashboard) return <DashboardLoading />;

  return (
    <div className={`${bgCss} min-h-svh w-full  text-white flex flex-col items-center pb-7 overflow-x-hidden`}>

      <div className=" max-w-xl m-auto min-h-svh w-full text-white pb-10 overflow-x-hidden">

        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-6 pt-10 pb-6">
          <GraduationCap className="text-white/80 h-7 w-7" />
          <div
            className="relative cursor-pointer"
            onClick={() => navigate(PATHS.STUDENT_NOTIFICATIONS)}
          >
            <Bell className="text-white/80 h-7 w-7" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-black" />
          </div>
        </header>

        <main className="px-6 space-y-8">
          {/* Welcome Text */}
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Hi {p?.nickname || p?.fullName || "Student"} <span className="animate-bounce">👋</span>
            </h1>
          </div>

          {/* ── MAIN FEATURE GRID ── */}
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={<MessageSquare className="text-cyan-400" />}
              title="ASK DOUBT"
              bg="bg-cyan-500/10"
              glow="shadow-[0_0_15px_rgba(34,211,238,0.2)] border-cyan-500/20"
              to={PATHS.ASK_DOUBT}
            />
            <FeatureCard
              icon={<Bot className="text-purple-500" />}
              title="AI TUTOR"
              bg="bg-purple-500/10"
              glow="shadow-[0_0_15px_rgba(168,85,247,0.2)] border-purple-500/20"
              to={PATHS.AI_CHAT}
            />
            <FeatureCard
              icon={<Users className="text-yellow-500" />}
              title="LIVE TEACHER"
              isNew
              bg="bg-yellow-500/10"
              glow="shadow-[0_0_15px_rgba(234,179,8,0.2)] border-yellow-500/20"
              to={PATHS.SHORT_LIVE_SESSION}
            />
            <FeatureCard
              icon={<ClipboardCheck className="text-emerald-400" />}
              title="DAILY MCQ TASK"
              bg="bg-emerald-500/10"
              desc={`Completed: ${dashboard?.mcq?.completed || 0}/${dashboard?.mcq?.total || 0}`}
              glow="shadow-[0_0_15px_rgba(52,211,153,0.2)] border-emerald-500/20"
              to={PATHS.MCQ}
            />
            <FeatureCard
              icon={<Trophy className="text-red-500" />}
              title="LEADERBOARD RANK"
              desc={`Your Rank: ${p?.leaderboardRank ?? dashboard?.data?.student?.leaderboardRank ?? 4}`}
              subDesc="↑ +3 Positions"
              bg="bg-red-500/10"
              glow="shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/20"
              to={PATHS.LEADERBOARD}
            />
            <FeatureCard
              icon={<GoldCoinsIcon />}
              title="REWARD POINTS"
              bg="bg-yellow-500/10"
              desc={`Total: ${(p?.totalPoints ?? p?.wallet?.totalPoints ?? dashboard?.data?.totalPoints ?? dashboard?.data?.student?.wallet?.totalPoints ?? 0).toLocaleString()} pts`}
              glow="shadow-[0_0_15px_rgba(234,179,8,0.2)] border-yellow-500/20"
              to={PATHS.WALLET}
            />
          </div>

          {/* Library Card Row */}
          <Card
            onClick={() => navigate(PATHS.LIBRARY)}
            className="w-full bg-[#1a1a1a]/40 border border-cyan-500/20 rounded-[2rem] p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] hover:border-cyan-400/40 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(6,182,212,0.05)] text-left"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                <BookOpen className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold tracking-widest text-white/80 uppercase">Study Material Library</h3>
                <p className="text-xs text-white/50 leading-snug">Access PDF notes, video lessons, and previous year papers</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); navigate(PATHS.LIBRARY); }}
              className="h-9 px-5 rounded-full bg-cyan-400 text-black text-xs font-black tracking-wider hover:bg-cyan-300 transition-all shadow-md shrink-0 uppercase"
            >
              Explore
            </Button>
          </Card>

          {/* ── SPECIAL WIDGETS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spin & Win Card */}
            <Card className="bg-[#1a1a1a]/40 border-purple-500/20 rounded-[2rem] p-6 text-center">
              <h3 className="text-sm font-bold tracking-widest text-white/80">SPIN & WIN TIMER</h3>
              <p className="text-[10px] text-white/40 mt-1">
                {secondsLeft > 0 ? `Next Spin in: ${formatDuration(secondsLeft)}` : "Daily free spin!"}
              </p>
              <div className="py-6 flex justify-center">
                <Clock className={cn("h-16 w-16 text-yellow-500 animate-pulse", secondsLeft > 0 && "opacity-40")} strokeWidth={1.5} />
              </div>
              <Button
                onClick={() => navigate(PATHS.SPINNER)}
                className={cn(
                  "w-full h-12 rounded-2xl font-black shadow-lg transition-all",
                  secondsLeft > 0
                    ? "bg-neutral-800 text-white/40 border border-white/5 cursor-not-allowed hover:bg-neutral-800"
                    : "bg-gradient-to-r from-yellow-400 to-orange-500 text-black active:scale-[0.98]"
                )}
              >
                {secondsLeft > 0 ? "SPIN TODAY" : "SPIN NOW"}
              </Button>
            </Card>

            {/* Upcoming Live Class */}
            <Card className="bg-[#1a1a1a]/40 border-blue-500/20 rounded-[2rem] p-6 overflow-hidden relative">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold tracking-widest text-white/80 uppercase">Upcoming Live Class</h3>
                  <p className="text-xs text-white/50 leading-snug">Topic: <span className="text-white">{dashboard?.liveClass?.topic || "No Class Scheduled"}</span></p>
                  <p className="text-[10px] text-white/40 italic">Time: {dashboard?.liveClass?.time || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold">{dashboard?.liveClass?.teacher || "Tutor"}</span>
                </div>
                <Button
                  onClick={() => navigate(PATHS.LIVE_SESSION, { state: { sessionId: dashboard?.liveClass?.sessionId } })}
                  className="w-full h-12 rounded-2xl bg-[#1e3a8e] border border-blue-400/30 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                  JOIN LIVE <span className="ml-2 font-mono text-[10px] opacity-70">{dashboard?.liveClass?.timer || "00:00"}</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* ── HORIZONTAL SCROLL SECTIONS ── */}
          <HorizontalSection title="SHORT LIVE SESSIONS" viewAllTo={PATHS.SHORT_LIVE_SESSION} items={dashboard?.shortLiveSessions} />
          <HorizontalSection title="SHORT VIDEO FEED" isVideo viewAllTo={PATHS.SHORT_VIDEO_FEED} items={dashboard?.shortLiveSessions} />
        </main>

        {/* ── BOTTOM NAVIGATION ── */}

      </div>
    </div>
  );
}

// --- Sub-Components ---





