import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, Users } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { bgCss } from "@/helper/CssHelper";
import { studentApi } from "@/lib/student-api";

const fetchReferralHistory = async () => {
  try {
    const response = await studentApi.getReferralData();
    const data = response?.data || response;
    const referrals = data?.referrals || [];
    const totalPoints = data?.totalPoints || 0;

    // Filter referrals by type (STUDENT vs TEACHER) and status
    // COMPLETED refers to users who registered but not rewarded
    // REWARDED refers to successful referral completions
    const studentActive = referrals.filter((r: any) => r.type === 'STUDENT' && r.status === 'COMPLETED');
    const studentCompleted = referrals.filter((r: any) => r.type === 'STUDENT' && r.status === 'REWARDED');
    const teacherActive = referrals.filter((r: any) => r.type === 'TEACHER' && r.status === 'COMPLETED');
    const teacherCompleted = referrals.filter((r: any) => r.type === 'TEACHER' && r.status === 'REWARDED');

    const toCard = (r: any, idx: number) => ({
      id: r._id,
      name: r.refereeName || r.refereeEmail || r.refereeMobile || `Referred Friend ${idx + 1}`,
      subject: r.type === 'TEACHER' ? 'Teacher Referral' : 'Student Referral',
      date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: r.status === 'REWARDED' ? 'Reward Credited' : 'Pending',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r._id}`,
    });

    return {
      stats: {
        total: referrals.length,
        points: String(totalPoints),
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
  } catch (err) {
    console.error("Failed to load referral data", err);
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
    <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center px-6 pt-5 overflow-x-hidden pb-10", bgCss)}>
      <div className="max-w-xl">

        {/* ── HEADER ── */}
        <header className="relative z-10 flex w-full items-center justify-between mb-5">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => navigate(PATHS.REFER_EARN)}>
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-xl tracking-tight">Referral History</h1>
          <div className="w-10" />
        </header>

        <main className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* ── STATS SECTION ── */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="py-0 bg-transparent border-cyan-500/40 shadow-[0_0_25px_rgba(34,211,238,0.1)] rounded-lg">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                  <Users size={12} /> Total Referrals
                </div>
                <h2 className="text-3xl font-black text-white">{data?.stats.total}</h2>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Invited</p>
              </CardContent>
            </Card>

            <Card className="py-0 bg-transparent border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.1)] rounded-lg">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-2">
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Total Points Earned</div>
                <h2 className="text-3xl font-black text-white">{data?.stats.points}</h2>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Points</p>
              </CardContent>
            </Card>
          </div>

          {/* ── TABS SECTION ── */}
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-900 border border-white/10 rounded-xl h-12 p-1">
              <TabsTrigger value="student" className="rounded-lg text-xs font-bold">Student Referrals</TabsTrigger>
              <TabsTrigger value="teacher" className="rounded-lg text-xs font-bold">Teacher Referrals</TabsTrigger>
            </TabsList>

            {/* STUDENT REFERRALS TAB CONTENT */}
            <TabsContent value="student" className="mt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Active/Pending</h3>
                {data?.student.active.length === 0 ? (
                  <p className="text-xs text-white/20">No active student referrals.</p>
                ) : (
                  data?.student.active.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Completed/Rewarded</h3>
                {data?.student.completed.length === 0 ? (
                  <p className="text-xs text-white/20">No rewarded student referrals.</p>
                ) : (
                  data?.student.completed.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* TEACHER REFERRALS TAB CONTENT */}
            <TabsContent value="teacher" className="mt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Active/Pending</h3>
                {data?.teacher.active.length === 0 ? (
                  <p className="text-xs text-white/20">No active teacher referrals.</p>
                ) : (
                  data?.teacher.active.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Completed/Rewarded</h3>
                {data?.teacher.completed.length === 0 ? (
                  <p className="text-xs text-white/20">No rewarded teacher referrals.</p>
                ) : (
                  data?.teacher.completed.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

        </main>
      </div>
    </div>
  );
}
