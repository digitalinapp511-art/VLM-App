import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  ChevronLeft, Calendar,
  Video, Star, User,
  Layers
} from "lucide-react";

type SessionCard = {
  id: string;
  name: string;
  subject: string;
  date: string;
  type: string;
  rating: string;
  avatar: string;
  icon: typeof Layers;
};
// import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

const fetchSessionHistory = async () => {
  try {
    const { sessions } = await studentApi.getMySessions();
    return sessions.map((s: any) => ({
      id: s.id,
      name: s.teacher?.fullName ?? "AI Tutor",
      subject: s.type,
      date: new Date(s.createdAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      type: s.type === 'VIDEO' ? 'Video Call' : s.type === 'AUDIO' ? 'Audio Call' : 'Chat Session',
      rating: s.feedback?.rating ? String(s.feedback.rating) + '.0' : 'N/A',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.teacher?.fullName ?? 'ai'}`,
      icon: Layers,
    }));
  } catch {
    return [];
  }
};

export default function SessionHistory() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useQuery<SessionCard[]>({
    queryKey: ["sessionHistory"],
    queryFn: fetchSessionHistory,
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className={`${bgCss}relative min-h-svh w-full bg-[#050505] text-white flex flex-col px-6 pb-10 overflow-x-hidden`}>
      
      {/* ── BACKGROUND DECOR ── */}
      <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-64 w-64 bg-cyan-600/10 blur-[100px] pointer-events-none" />
      <div className="max-w-xl w-full flex m-auto flex-col justify-center items-center min-h-svh ">

      {/* ── HEADER ── */}
      <header className="relative z-10 flex w-full items-center justify-between pt-10 pb-8">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white" onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}>
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-serif font-bold tracking-tight uppercase">
          Session History
        </h1>
        <div className="w-10" />
      </header>

      {/* ── HISTORY LIST ── */}
      <main className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {sessions?.map((session: SessionCard) => (
          <Card 
            key={session.id} 
            className="group border-white/5 bg-white/[0.03] border-1 border-purple-500/50 backdrop-blur-2xl rounded-lg overflow-hidden transition-all hover:bg-white/[0.06] hover:border-purple-500/80"
          >
            <CardContent className="p-1 px-4">
              <div className="flex gap-5">
                {/* Avatar Section */}
                <Avatar className="h-20 w-20 border-2 border-white/10 rounded-2xl shrink-0 shadow-2xl">
                  <AvatarImage src={session.avatar} />
                  <AvatarFallback className="bg-purple-900/20 text-white"><User /></AvatarFallback>
                </Avatar>

                {/* Info Section */}
                <div className="flex-1 space-y-2.5">
                  <h3 className="text-xl font-bold text-white tracking-tight leading-none">
                    {session.name}
                  </h3>
                  
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                      <session.icon size={16} className="text-purple-400" />
                      {session.subject}
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Calendar size={16} />
                      {session.date}
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Video size={16} />
                      {session.type}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section: Rating & Action */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-[#f5a623]">{session.rating}</span>
                  <Star size={18} className="text-[#f5a623] fill-[#f5a623] opacity-40" />
                </div>

                <div className="relative group/btn">
                  <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <Button
                    variant="outline"
                    onClick={() => navigate(PATHS.LIVE_SESSION)}
                    className="relative h-11 px-6 rounded-full border-blue-500/50 bg-blue-500/5 text-white font-bold text-sm hover:bg-blue-600 hover:border-blue-400 transition-all active:scale-95"
                  >
                    View Details &gt;
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
    <div className="p-6 space-y-6 bg-black min-h-screen">
      <Skeleton className="h-10 w-48 bg-white/5" />
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-56 rounded-[2.5rem] bg-white/5" />
      ))}
    </div>
  );
}