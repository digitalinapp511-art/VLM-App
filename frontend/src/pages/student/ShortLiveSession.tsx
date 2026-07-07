import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  ChevronLeft, Search, SlidersHorizontal, Star, PlayCircle,
  User, Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShortSession = {
  id: string;
  tutor: string;
  rating: string;
  viewers: string;
  topic: string;
  rate: string;
  desc: string;
  avatar: string;
  theme: string;
};

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

const themes = [
  "border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]",
  "border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.1)]",
  "border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.1)]",
];

const fetchShortSessions = async () => {
  const teachers = await studentApi.getAvailableTeachers({ limit: 5 });
  return (teachers ?? []).map((t: any, i: number) => ({
    id: t.id,
    tutor: t.fullName,
    rating: String(t.rating ?? '5.0'),
    viewers: '0',
    topic: t.qualification ?? 'Expert Tutoring Session',
    rate: '10',
    desc: t.qualification ?? 'Expert Teacher',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.fullName}`,
    theme: themes[i % themes.length],
  }));
};

export default function ShortLiveSessions() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useQuery<ShortSession[]>({
    queryKey: ["shortSessions"],
    queryFn: fetchShortSessions,
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className={`${bgCss}relative min-h-svh w-full bg-[#050505] text-white flex flex-col px-6 pb-24 overflow-x-hidden`}>
      <div className="max-w-xl w-full flex m-auto flex-col justify-center items-center min-h-svh ">
      
      {/* ── HEADER ── */}
      <header className="relative z-10 flex w-full items-center justify-between pt-10 pb-2">
         <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white shrink-0" onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}>
           <ChevronLeft size={20} />
         </Button>
         <div className="flex flex-col flex-1 px-3">
            <h1 className="text-2xl font-serif    tracking-tight uppercase leading-none">
              Short Live Sessions Feed
            </h1>
            <p className="text-xs text-white/40 mt-2 font-medium tracking-tight">
                Instant help from expert tutors!
            </p>
         </div>
         <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <Search size={28} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <SlidersHorizontal size={28} />
            </Button>
         </div>
      </header>

      {/* ── SESSIONS LIST ── */}
      <main className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {!sessions?.length && (
          <p className="text-center text-white/40 text-sm py-8">No teachers available right now</p>
        )}
        {sessions?.map((session: ShortSession) => (
          <Card 
            key={session.id} 
            className={cn(
              "relative border bg-white/[0.02] backdrop-blur-2xl rounded-xl overflow-hidden transition-all hover:bg-white/[0.05]",
              session.theme
            )}
          >
            <CardContent className="p-6 py-2 space-y-5">
              
              {/* Top Row: Avatar & Name & Stats */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-white/10 rounded-full shadow-2xl">
                  <AvatarImage src={session.avatar} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <div className="flex items-center justify-between gap-10">
                        <h4 className="   text-white tracking-tight">{session.tutor}</h4>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[#f5a623]">
                                <div className="text-xs    flex  gap-1">
                                <Star size={14} className="fill-current " />
                                    <span>
                                    {session.rating}

                                    </span>
                                    </div>
                            </div>
                            <div className="flex items-center gap-1 text-white/40">
                                <Circle size={4} className="fill-current" />
                                <span className="text-[10px]    uppercase tracking-wider">{session.viewers}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-white/50 mt-1 font-medium">{session.topic}</p>
                </div>
              </div>

              {/* Status Row: Live Badge & Rate */}
              <div className="flex items-center justify-between">
                 <Badge className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black px-3 py-0.5 rounded-full flex gap-1.5 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                 </Badge>

                 <div className="flex items-center gap-2">
                    <p className="text-[10px] text-white/40    uppercase tracking-widest">Rate: ₹{session.rate} / min</p>
                    <div className="h-4 w-4 rounded-full bg-[#f5a623] shadow-[0_0_10px_rgba(245,166,35,0.4)]" />
                 </div>
              </div>

              {/* Action Section */}
              <div className="flex items-end justify-between pt-2">
                 <p className="text-[10px] text-white/30 font-medium max-w-[120px] leading-relaxed italic">
                    {session.desc}
                 </p>

                 <div className="relative group/btn">
                    <div className="absolute inset-0 bg-blue-600/30 blur-2xl rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    <Button onClick={() => navigate(PATHS.LIVE_SESSION)} className="relative h-10 px-6 rounded-full bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white shadow-xl hover:brightness-110 active:scale-95 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                             <span className="text-xs font-black tracking-widest leading-none">WATCH</span>
                             <span className="text-xs font-black tracking-widest leading-none">SESSION</span>
                          </div>
                          <PlayCircle size={28} className="fill-white text-[#0f172a]" />
                       </div>
                    </Button>
                 </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </main>

    </div>
    </div>
  );
}

// ── Skeleton Loader ──
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-8 bg-[#f4f6ff] dark:bg-[#0b081e] min-h-screen transition-colors duration-300">
      <Skeleton className="h-12 w-64 bg-slate-200 dark:bg-slate-800" />
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}