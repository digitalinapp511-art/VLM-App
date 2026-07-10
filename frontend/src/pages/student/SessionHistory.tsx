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
    const response = await studentApi.getMySessions();
    const sessions = response?.data || response?.sessions || response || [];
    
    if (!Array.isArray(sessions)) return [];

    return sessions.map((s: any) => ({
      id: s._id || s.id,
      name: s.teacherId?.fullName ?? "AI Tutor",
      subject: s.subject || "General Doubt",
      date: new Date(s.createdAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      type: s.type === 'video' ? 'Human Video Call' : 
            s.type === 'audio' ? 'Human Audio Call' : 
            s.type === 'chat' ? 'Human Chat' : 
            s.type === 'ai' ? 'AI Chat' : 'Chat Session',
      rating: s.studentBehaviourRating ? String(s.studentBehaviourRating) + '.0' : 'N/A',
      avatar: s.teacherId?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.teacherId?.fullName ?? 'ai'}`,
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
    <div className="relative min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center pb-28 overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* ── BACKGROUND DECOR ── */}
      <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-purple-600/5 dark:bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-64 w-64 bg-cyan-600/5 dark:bg-cyan-600/10 blur-[100px] pointer-events-none" />

      {/* ── HEADER ── */}
      <header className="w-full max-w-xl flex items-center justify-between px-6 py-6 mt-4 relative z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white" 
          onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
          Session History
        </h1>
        <div className="w-10" />
      </header>

      {/* ── HISTORY LIST ── */}
      <main className="w-full max-w-xl px-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {sessions?.length === 0 ? (
          <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] rounded-3xl p-8 text-center space-y-3">
            <Layers className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No Sessions Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">You haven't requested any doubt sessions yet.</p>
          </Card>
        ) : (
          sessions?.map((session: SessionCard) => (
            <Card 
              key={session.id} 
              className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Avatar Section */}
                  <Avatar className="h-16 w-16 border border-slate-150 dark:border-slate-800 rounded-2xl shrink-0">
                    <AvatarImage src={session.avatar} />
                    <AvatarFallback className="bg-purple-900/10 text-purple-600"><User size={20} /></AvatarFallback>
                  </Avatar>

                  {/* Info Section */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wide truncate">
                      {session.name}
                    </h3>
                    
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        <session.icon size={14} className="text-violet-600 shrink-0" />
                        <span className="truncate">{session.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                        <Calendar size={14} className="shrink-0" />
                        <span className="truncate">{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                        <Video size={14} className="shrink-0" />
                        <span className="truncate">{session.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Section: Rating & Action */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-[#f5a623] fill-[#f5a623]" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{session.rating}</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
                    className="h-9 px-4 rounded-xl border-violet-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-violet-600 dark:text-slate-300 font-black text-xs uppercase hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all"
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}

// ── Skeleton Loader ──
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-[#f4f6ff] dark:bg-[#0b081e] min-h-screen transition-colors duration-300">
      <Skeleton className="h-10 w-48 bg-slate-200 dark:bg-slate-800" />
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}