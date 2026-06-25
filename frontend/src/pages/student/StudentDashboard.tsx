import { bgCss } from "@/helper/CssHelper";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import HorizontalSection from "@/components/basic/student/HorizontalSection";
import DashboardLoading from "@/components/basic/DashboardLoading";
import FeatureCard from "@/components/basic/student/FeatureCard";
import {
  Bell, GraduationCap, MessageSquare, Bot, Users,
  ClipboardCheck, Trophy, Coins, Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

// Shadcn Components
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchDashboard();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/student/profile");
      const profileData = res.data?.data ?? res.data;
      setProfile(profileData);
      const isIncomplete =
        !profileData?.fullName ||
        !(profileData?.className || profileData?.class) ||
        !profileData?.board ||
        !profileData?.nickname;
      if (isIncomplete) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
      }
    } catch (err: any) {
      // If profile doesn't exist at all (404), redirect to setup
      if (err?.response?.status === 404) {
        navigate(PATHS.STUDENT_PROFILE_SETUP, { replace: true });
      } else {
        console.error("Error fetching profile:", err);
      }
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get("/student/dashboard");
      setDashboard(res.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <DashboardLoading />;

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
              Hi {profile?.nickname || profile?.fullName || dashboard?.user?.name || "Student"} <span className="animate-bounce">👋</span>
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
              to={`${PATHS.ASK_DOUBT}?mode=ai`}
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
              desc={`Your Rank: ${dashboard?.user?.rank || "N/A"}`}
              subDesc="↑ +3 Positions"
              bg="bg-red-500/10"
              glow="shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/20"
            />
            <FeatureCard
              icon={<Coins className="text-yellow-500" />}
              title="REWARD POINTS"
              bg="bg-yellow-500/10"
              desc={`Total: ${dashboard?.user?.points || 0} pts`}
              glow="shadow-[0_0_15px_rgba(234,179,8,0.2)] border-yellow-500/20"
              to={PATHS.REFER_EARN}
            />
          </div>

          {/* ── SPECIAL WIDGETS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spin & Win Card */}
            <Card className="bg-[#1a1a1a]/40 border-purple-500/20 rounded-[2rem] p-6 text-center">
              <h3 className="text-sm font-bold tracking-widest text-white/80">SPIN & WIN TIMER</h3>
              <p className="text-[10px] text-white/40 mt-1">Next Spin in: 00:48:12</p>
              <div className="py-6 flex justify-center">
                <Clock className="h-16 w-16 text-yellow-500 animate-pulse" strokeWidth={1.5} />
              </div>
              <Button
                onClick={() => navigate(PATHS.SPINNER)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black shadow-lg"
              >
                SPIN NOW
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
          <HorizontalSection title="SHORT VIDEO FEED" isVideo viewAllTo={PATHS.VIDEO_UPLOAD} items={dashboard?.shortLiveSessions} />
        </main>

        {/* ── BOTTOM NAVIGATION ── */}

      </div>
    </div>
  );
}

// --- Sub-Components ---





