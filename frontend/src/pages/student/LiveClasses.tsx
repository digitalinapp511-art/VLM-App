import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { useNavigate } from "react-router-dom";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";
import { PATHS } from "@/routes/paths";
import { Search, Bell, User } from "lucide-react";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLiveClasses } from "@/hooks/use-student";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

type LiveClassData = {
  success?: boolean;
  data?: any[];
};

export default function LiveClasses() {
  const navigate = useNavigate();
  const { data, isLoading } = useLiveClasses<any>();

  if (isLoading) return <LoadingSkeleton />;

  // Extract classes from response array
  const classes = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

  // Partition live and upcoming classes dynamically
  const dbLive = classes.find((c: any) => c.status === 'live');
  const liveNow = dbLive ? {
    viewers: dbLive.viewers || 1200,
    avatar: dbLive.teacherId?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbLive.teacherId?.fullName ?? 'sharma'}`,
    tag: dbLive.subject || "General",
    teacher: dbLive.teacherId?.fullName || "Educator",
    startTime: dbLive.startedAt ? "Started " + Math.round((Date.now() - new Date(dbLive.startedAt).getTime()) / 60000) + " mins ago" : "Starts 5 mins ago",
    topic: dbLive.topic || dbLive.title || "Live Session",
    sessionId: dbLive._id,
  } : {
    viewers: 1200,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sharma`,
    tag: "JEE Mains",
    teacher: "Dr. Sharma",
    startTime: "Starts 5 mins ago",
    topic: "JEE Mains: Advanced Trigonometry & Formulas",
    sessionId: "mock-live-1",
  };

  const dbUpcoming = classes.filter((c: any) => c._id !== dbLive?._id);
  const upcoming = dbUpcoming.length > 0 ? dbUpcoming.map((c: any) => ({
    id: c._id,
    avatar: c.teacherId?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.teacherId?.fullName ?? 'patel'}`,
    teacher: c.teacherId?.fullName || "Educator",
    topic: `${c.topic || c.title} (${c.board || 'CBSE'} ${c.class || '12th'} Board)`,
    date: c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString('en-IN', { weekday: 'long' }) : "Today",
    time: c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "11:30 AM",
    sessionId: c._id,
  })) : [
    {
      id: "up-1",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=patel`,
      teacher: "Prof. Patel",
      topic: "Chemical Bonding (CBSE 12th Board)",
      date: "Today",
      time: "11:30 AM",
      sessionId: "mock-live-2",
    },
    {
      id: "up-2",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=iyer`,
      teacher: "Mrs. Iyer",
      topic: "English Essay Writing & Advanced Editing",
      date: "Tomorrow",
      time: "2:00 PM",
      sessionId: "mock-live-3",
    },
    {
      id: "up-3",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=singh`,
      teacher: "Mr. Singh",
      topic: "Data Interpretation: Tricks & Short-cuts",
      date: "Next Week",
      time: "5:00 PM",
      sessionId: "mock-live-4",
    }
  ];

  return (
    <div className="min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center pb-28 overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-cyan-600/5 dark:bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-64 w-64 bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto flex flex-col gap-5">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between px-6 py-6 mt-4 relative z-10">
          <div className="h-10 w-10 rounded-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center overflow-hidden">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400"><User size={16} /></AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex gap-3">
            <button className="h-10 w-10 rounded-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all">
              <Search size={18} />
            </button>
            <button className="h-10 w-10 rounded-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* ── TITLE ── */}
        <div className="space-y-0.5 px-6">
          <h1 className="text-xl font-black tracking-tight text-slate-855 dark:text-white uppercase">Live Classes</h1>
          <p className="text-[9px] tracking-wider text-slate-400 dark:text-slate-500 uppercase font-black">Learn Without Limits</p>
        </div>

        <main className="px-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* ── LIVE NOW SECTION ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black tracking-wider text-slate-550 dark:text-slate-400 uppercase">Live Now</h2>
              <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/25">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black text-red-500 dark:text-red-400 uppercase tracking-wider">
                  {liveNow.viewers >= 1000 ? `${(liveNow.viewers/1000).toFixed(1)}k` : liveNow.viewers} Viewers
                </span>
              </div>
            </div>

            <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] rounded-3xl shadow-sm overflow-hidden p-5">
              <CardContent className="p-0 flex flex-col gap-5">
                <div className="flex gap-4 items-start">
                  <div className="relative shrink-0">
                    <Avatar className="h-16 w-16 border border-slate-100 dark:border-slate-800 rounded-2xl shrink-0">
                      <AvatarImage src={liveNow.avatar} />
                      <AvatarFallback className="bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold"><User /></AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[7.5px] font-black tracking-wide px-2 py-0.5 whitespace-nowrap rounded-md uppercase border-none">
                      {liveNow.tag}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase truncate">{liveNow.teacher}</h3>
                      <span className="text-[8.5px] text-violet-600 dark:text-violet-400 font-black uppercase tracking-wider shrink-0">{liveNow.startTime}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-normal break-words">
                      {liveNow.topic}
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate(PATHS.LIVE_SESSION, { state: { sessionId: liveNow.sessionId } })} 
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider text-xs border-none cursor-pointer"
                >
                  Join Live
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── UPCOMING CLASSES ── */}
          <div className="space-y-3">
            <h2 className="text-xs font-black tracking-wider text-slate-550 dark:text-slate-400 uppercase px-1">Upcoming Classes</h2>
            <div className="space-y-3">
              {upcoming.map((item: any) => (
                <Card key={item.id} className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] rounded-3xl transition-all shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="flex flex-col items-center shrink-0">
                        <Avatar className="h-11 w-11 border border-slate-100 dark:border-slate-800 rounded-full">
                          <AvatarImage src={item.avatar} />
                          <AvatarFallback className="bg-slate-100 text-slate-400"><User /></AvatarFallback>
                        </Avatar>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 block text-center max-w-[50px] truncate font-black uppercase">{item.teacher}</span>
                      </div>
                      
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-black text-slate-850 dark:text-white leading-normal truncate">
                          {item.topic}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          {item.date} | {item.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between h-14 shrink-0">
                      <button className="text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500 active:scale-95 transition-all cursor-pointer">
                        <Bell size={15} />
                      </button>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(PATHS.LIVE_SESSION, { state: { sessionId: item.sessionId } })} 
                        className="h-7 px-3.5 rounded-xl bg-transparent border border-violet-250 dark:border-slate-800 text-violet-600 dark:text-slate-350 text-[9px] font-black tracking-wider hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all cursor-pointer"
                      >
                        JOIN
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
      
      {/* ── BOTTOM NAVIGATION ── */}
      <StudentBottomNav />
    </div>
  );
}
