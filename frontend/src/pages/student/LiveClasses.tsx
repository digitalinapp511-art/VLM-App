import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Search, Bell,  User } from "lucide-react";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLiveClasses } from "@/hooks/use-student";

type LiveClassData = {
  liveNow?: {
    viewers?: number;
    avatar?: string;
    tag?: string;
    teacher?: string;
    startTime?: string;
    topic?: string;
    sessionId?: string;
  };
  upcoming?: Array<{
    id: string;
    avatar?: string;
    teacher?: string;
    topic?: string;
    date?: string;
    time?: string;
    sessionId?: string;
  }>;
};

export default function LiveClasses() {
  const navigate = useNavigate();
  const { data, isLoading } = useLiveClasses<LiveClassData>();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-svh bg-linear-to-br/srgb from-cyan-900 from-0% via-black via-40% to-purple-600 to-210% w-full bg-[#050505] text-white flex flex-col px-6 pb-24 overflow-x-hidden">
      <div className="max-w-xl m-auto">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between pt-10 pb-1">
        <Avatar className="h-12 w-12 border border-white/10 bg-blue-900/20 shadow-xl">
           <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 text-white">
            <Search size={20} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 text-white">
            <Bell size={20} />
          </Button>
        </div>
      </header>

      {/* ── TITLE ── */}
      <div className="space-y-1 mb-4">
        <h1 className="text-xl font-serif       tracking-tight uppercase">Live Classes</h1>
        <p className="text-[10px] tracking-[0.4em] text-white/40       uppercase">Learn Without Limits</p>
      </div>

      <main className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* ── LIVE NOW SECTION ── */}
        {data?.liveNow && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black tracking-widest text-white uppercase">Live Now</h2>
            <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px]       text-white/60">{data.liveNow.viewers} Viewers</span>
            </div>
          </div>

          <Card className="relative border-cyan-500/40 bg-transparent backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_40px_rgba(34,211,238,0.05)] overflow-visible">
            <CardContent className="px-5 py-1">
              <div className="flex gap-5">
                <div className="relative shrink-0">
                  <Avatar className="h-20 w-20 border-2 border-cyan-500/50 shadow-2xl">
                    <AvatarImage src={data.liveNow.avatar} />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-cyan-500/50 text-cyan-400 text-[8px]       px-2 py-0">
                    {data.liveNow.tag}
                  </Badge>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg       text-white">{data.liveNow.teacher}</h3>
                    <span className="text-[10px]       text-cyan-400">{data.liveNow.startTime}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-tight      ">
                    {data.liveNow.topic}
                  </p>
                </div>
              </div>

              <div className="mt-8 relative">
                <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full" />
                <Button onClick={() => navigate(PATHS.LIVE_SESSION, { state: { sessionId: data.liveNow?.sessionId } })} className="relative text-white w-full h-14 rounded-full bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 font-black tracking-widest shadow-2xl hover:brightness-110">
                  JOIN LIVE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* ── UPCOMING CLASSES ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-black tracking-widest text-white uppercase">Upcoming Classes</h2>
          <div className="space-y-4">
            {data?.upcoming?.length ? data.upcoming.map((item) => (
              <Card key={item.id} className="bg-white/5 border-white/5 backdrop-blur-lg rounded-3xl transition-all hover:bg-white/[0.08]">
                <CardContent className="px-4 py-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <Avatar className="h-12 w-12 border border-white/10">
                        <AvatarImage src={item.avatar} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <span className="text-[9px] text-white/30      ">{item.teacher}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs       text-white/90 max-w-[180px] leading-tight">
                        {item.topic}
                      </h4>
                      <p className="text-[10px] text-white/30      ">
                        {item.date} | {item.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <Bell size={16} className="text-white/20" />
                    <Button size="sm" onClick={() => navigate(PATHS.LIVE_SESSION, { state: { sessionId: item.sessionId } })} className="h-9 px-6 rounded-xl bg-transparent border border-cyan-500/50 text-cyan-400 text-xs font-black tracking-widest hover:bg-cyan-500/10">
                      JOIN
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <p className="text-sm text-white/40 text-center py-4">No upcoming classes scheduled</p>
            )}
          </div>
        </div>
      </main>
    </div>
      </div>

  );
}
