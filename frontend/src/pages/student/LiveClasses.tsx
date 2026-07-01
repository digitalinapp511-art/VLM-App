import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { useNavigate } from "react-router-dom";
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
    <div className={cn("min-h-svh w-full text-white flex flex-col px-6 pb-28 overflow-x-hidden relative", bgCss)}>
      
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-cyan-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-64 w-64 bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between pt-8 pb-1 z-10">
          <div className="h-10 w-10 rounded-full bg-blue-900/30 border border-white/10 flex items-center justify-center overflow-hidden">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-cyan-950 text-cyan-400"><User size={16} /></AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex gap-3">
            <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 active:scale-95 transition-all hover:bg-white/10">
              <Search size={18} />
            </button>
            <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 active:scale-95 transition-all hover:bg-white/10">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* ── TITLE ── */}
        <div className="space-y-0.5 mb-2">
          <h1 className="text-2xl font-extrabold tracking-wider uppercase text-white">Live Classes</h1>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold">Learn Without Limits</p>
        </div>

        <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* ── LIVE NOW SECTION ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black tracking-widest text-white/60 uppercase">Live Now</h2>
              <div className="flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/25">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
                  {liveNow.viewers >= 1000 ? `${(liveNow.viewers/1000).toFixed(1)}k` : liveNow.viewers} Viewers
                </span>
              </div>
            </div>

            <Card className="relative border border-cyan-500/35 bg-black/45 backdrop-blur-2xl rounded-[2.2rem] shadow-[0_0_35px_rgba(6,182,212,0.12)] overflow-visible p-6">
              <CardContent className="p-0 flex flex-col gap-6">
                <div className="flex gap-5 items-start">
                  <div className="relative shrink-0">
                    <Avatar className="h-20 w-20 border-2 border-cyan-400/80 rounded-2xl shrink-0 shadow-2xl">
                      <AvatarImage src={liveNow.avatar} />
                      <AvatarFallback className="bg-cyan-950 text-cyan-400 font-bold"><User /></AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-black border border-cyan-400/80 text-cyan-400 text-[8px] font-bold tracking-wide px-2.5 py-0.5 whitespace-nowrap rounded-md uppercase">
                      {liveNow.tag}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold text-white tracking-wide">{liveNow.teacher}</h3>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{liveNow.startTime}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-snug">
                      {liveNow.topic}
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate(PATHS.LIVE_SESSION, { state: { sessionId: liveNow.sessionId } })} 
                  className="w-full h-12 rounded-full bg-[#1b3b6f] border border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider text-xs"
                >
                  Join Live
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── UPCOMING CLASSES ── */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-white/60 uppercase">Upcoming Classes</h2>
            <div className="space-y-4">
              {upcoming.map((item: any) => (
                <Card key={item.id} className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] transition-all hover:bg-white/[0.06]">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center shrink-0">
                        <Avatar className="h-12 w-12 border border-white/10 rounded-full">
                          <AvatarImage src={item.avatar} />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <span className="text-[9px] text-white/40 mt-1 block text-center max-w-[56px] truncate font-semibold">{item.teacher}</span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white/95 leading-snug">
                          {item.topic}
                        </h4>
                        <p className="text-xs text-white/35 font-medium mt-0.5">
                          {item.date} | {item.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between h-14 shrink-0">
                      <button className="text-white/20 hover:text-white/40 active:scale-95 transition-all">
                        <Bell size={16} />
                      </button>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(PATHS.LIVE_SESSION, { state: { sessionId: item.sessionId } })} 
                        className="h-8 px-5 rounded-full bg-transparent border border-cyan-500/50 text-cyan-400 text-[10px] font-black tracking-wider hover:bg-cyan-500/10 active:scale-95 transition-all"
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
    </div>
  );
}
