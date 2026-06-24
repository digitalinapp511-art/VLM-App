import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Users, } from "lucide-react";
// import { cn } from "@/lib/utils";
import HistoryCard from "@/components/basic/student/HistoryCard";

type ReferralCard = {
  id: string;
  name: string;
  subject: string;
  date: string;
  status: string;
  avatar: string;
};

type ReferralHistoryData = {
  stats: {
    total: number;
    points: string;
  };
  student: {
    active: ReferralCard[];
    completed: ReferralCard[];
  };
  teacher: {
    active: ReferralCard[];
    completed: ReferralCard[];
  };
};
// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

const fetchReferralHistory = async () => {
  try {
    const referrals = await studentApi.getReferralHistory();
    const wallet = await studentApi.getStats();

    const studentActive = referrals.filter((r: any) => r.type === 'STUDENT' && r.status === 'COMPLETED');
    const studentCompleted = referrals.filter((r: any) => r.type === 'STUDENT' && r.status === 'REWARDED');
    const teacherActive = referrals.filter((r: any) => r.type === 'TEACHER' && r.status === 'COMPLETED');
    const teacherCompleted = referrals.filter((r: any) => r.type === 'TEACHER' && r.status === 'REWARDED');

    const toCard = (r: any, idx: number) => ({
      id: r.id,
      name: r.referee?.email ?? r.referee?.mobile ?? `Referred User ${idx + 1}`,
      subject: r.type === 'TEACHER' ? 'Teacher Referral' : 'Student Referral',
      date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: r.status === 'REWARDED' ? 'Reward Credited' : 'Approved',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.id}`,
    });

    return {
      stats: {
        total: referrals.length,
        points: String(wallet.rewardPoints ?? 0),
      },
      student: {
        active: studentActive.map(toCard),
        completed: studentCompleted.map(toCard),
      },
      teacher: {
        active: teacherActive.map(toCard),
        completed: teacherCompleted.map(toCard),
      },
    };
  } catch {
    return {
      stats: { total: 0, points: '0' },
      student: { active: [], completed: [] },
      teacher: { active: [], completed: [] },
    };
  }
};

export default function ReferralHistory() {
  const navigate = useNavigate();
  const { data } = useQuery<ReferralHistoryData>({
    queryKey: ["referralHistory"],
    queryFn: fetchReferralHistory,
  });
  return (
    <div className={`${bgCss}relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-5 overflow-x-hidden pb-10`}>
      <div className="max-w-xl">


        {/* ── HEADER ── */}
        <header className="relative z-10 flex w-full items-center justify-between mb-5">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => navigate(PATHS.REFER_EARN)}>
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-xl   tracking-tight">Referral History</h1>
          <div className="w-10" />
        </header>

        <main className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* ── STATS SECTION ── */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="py-0 bg-transparent border-cyan-500/40 shadow-[0_0_25px_rgba(34,211,238,0.1)] rounded-;g">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-2">
                <div className="flex items-center gap-2 text-[10px]   text-white/40 uppercase tracking-widest">
                  <Users size={12} /> Total Referrals
                </div>
                <h2 className="text-3xl font-black text-white">{data?.stats.total}</h2>
                <p className="text-[10px] text-white/30   uppercase tracking-widest">Referrals</p>
              </CardContent>
            </Card>

            <Card className="py-0 bg-transparent border-white/10 rounded-lg">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-2">
                <div className="text-[10px]   text-white/40 uppercase tracking-widest">Total Points Earned</div>
                <h2 className="text-3xl font-black text-white">{data?.stats.points}</h2>
                <p className="text-[10px] text-white/30   uppercase tracking-widest">Points</p>
              </CardContent>
            </Card>
          </div>

          {/* ── TABS SECTION ── */}
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="w-full bg-transparent p-0 flex gap-4 h-auto">
              <TabsTrigger
                value="student"
                className="flex-1 h-12 rounded-full border border-white/5 bg-transparent data-[state=active]:bg-cyan-500 data-[state=active]:text-cyan-400  data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-900   text-sm transition-all"
              >
                Student Referrals
              </TabsTrigger>
              <TabsTrigger
                value="teacher"
                className="flex-1 h-12 rounded-full border border-white/5 bg-transparent data-[state=active]:bg-cyan-500/10 data-[state=active]:border-cyan-500/50 data-[state=active]:text-cyan-400   text-sm transition-all"
              >
                Teacher Referrals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-8 space-y-8 animate-in fade-in duration-500">
              {/* Active Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black tracking-widest text-cyan-400 uppercase ml-1">Active Referrals</h3>
                {data?.student?.active.map((item: any) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>

              {/* Completed Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black tracking-widest text-green-500 uppercase ml-1">Completed Referrals</h3>
                {data?.student?.completed.map((item: any) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="teacher" className="mt-8 space-y-8 animate-in fade-in duration-500">
              {/* <div className="py-20 text-center text-white/20 italic">No teacher referrals yet.</div> */}
              {/* Active Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black tracking-widest text-cyan-400 uppercase ml-1">Active Referrals</h3>
                {data?.teacher?.active.map((item: any) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>

              {/* Completed Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black tracking-widest text-green-500 uppercase ml-1">Completed Referrals</h3>
                {data?.teacher?.completed.map((item: any) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Note */}
          <p className="text-center text-[10px] text-white/20 leading-relaxed pt-4">
            * Referral rewards are credited <br /> after successful account verification.
          </p>

        </main>
      </div>
    </div>
  );
}

// ── Internal History Card Component ──
