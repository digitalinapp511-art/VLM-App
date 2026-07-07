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
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl w-full flex flex-col min-h-svh pb-24">

        {/* ── HEADER ── */}
        <header className="relative z-10 flex w-full items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
            onClick={() => navigate(PATHS.REFER_EARN)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-md font-black tracking-tight uppercase">Referral History</h1>
          <div className="w-10" />
        </header>

        <main className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* ── STATS SECTION ── */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] shadow-sm overflow-hidden">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">
                  <Users size={12} /> Total Referrals
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">{data?.stats.total}</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Invited</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] shadow-sm overflow-hidden">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-1">
                <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Total Earned</div>
                <h2 className="text-2xl font-black text-violet-600 dark:text-violet-400">{data?.stats.points}</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Points</p>
              </CardContent>
            </Card>
          </div>

          {/* ── TABS SECTION ── */}
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#221c4e] rounded-xl h-11 p-1">
              <TabsTrigger value="student" className="rounded-lg text-xs font-black uppercase tracking-wider">Student Referrals</TabsTrigger>
              <TabsTrigger value="teacher" className="rounded-lg text-xs font-black uppercase tracking-wider">Teacher Referrals</TabsTrigger>
            </TabsList>

            {/* STUDENT REFERRALS TAB CONTENT */}
            <TabsContent value="student" className="mt-5 space-y-5">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active/Pending</h3>
                {data?.student.active.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500/80">No active student referrals.</p>
                ) : (
                  data?.student.active.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed/Rewarded</h3>
                {data?.student.completed.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500/80">No rewarded student referrals.</p>
                ) : (
                  data?.student.completed.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* TEACHER REFERRALS TAB CONTENT */}
            <TabsContent value="teacher" className="mt-5 space-y-5">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active/Pending</h3>
                {data?.teacher.active.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500/80">No active teacher referrals.</p>
                ) : (
                  data?.teacher.active.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed/Rewarded</h3>
                {data?.teacher.completed.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500/80">No rewarded teacher referrals.</p>
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
