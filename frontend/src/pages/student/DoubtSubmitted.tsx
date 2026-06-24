import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
 GraduationCap, CheckCircle2, 
  Atom, Book, MessageSquare, Key, Star, 
  Tv
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";
import { useLocation } from "react-router-dom";

const fetchSubmittedDoubt = async (doubtId?: string) => {
  if (doubtId) {
    try {
      const doubt = await studentApi.getDoubtById(doubtId);
      return {
        subject: doubt.subject?.name ?? "General",
        chapter: doubt.chapter?.name ?? "—",
        mode: doubt.status === 'ASSIGNED' ? 'Human Tutor' : 'Pending Assignment',
        estimatedTime: "2 hours",
      };
    } catch { /* fall through */ }
  }
  return { subject: "Submitted", chapter: "See session history", mode: "Human Tutor", estimatedTime: "2 hours" };
};

export default function DoubtSubmitted() {
  const navigate = useNavigate();
  const location = useLocation();
  const doubtId = location.state?.doubtId as string | undefined;

  const { data } = useQuery({
    queryKey: ["submittedDoubt", doubtId],
    queryFn: () => fetchSubmittedDoubt(doubtId),
  });

  return (
    <div className={`${bgCss}relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-4 overflow-x-hidden pb-10`}>
      <div className="max-w-xl">

      {/* ── BACKGROUND DECOR (Floating Icons) ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <Key className="absolute top-[30%] left-[5%] -rotate-45 text-white/20" size={32} />
         <Tv className="absolute top-[40%] left-[8%] rotate-12 text-white/20" size={28} />
         <Star className="absolute top-[10%] left-[10%] text-blue-500/40 h-4 w-4" />
         <div className="absolute top-[25%] right-[10%] h-24 w-24 border border-dashed border-white/10 rounded-full flex items-center justify-center">
            <MessageSquare size={24} className="text-white/20" />
            <Star size={12} className="absolute -bottom-2 -right-2 text-purple-500 fill-current" />
         </div>
         <div className="absolute top-[20%] left-[-10%] h-64 w-64 bg-cyan-900/10 blur-[100px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-10 text-center mb-2">
        <h1 className="text-2xl font-serif    tracking-[0.15em] uppercase text-white/90">
            VLM Academy
        </h1>
      </header>

      {/* ── TOP ILLUSTRATION ── */}
      <div className="relative mb-2 animate-in zoom-in duration-700">
         <div className="relative h-40 w-40 mx-auto flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-3 rounded-full border border-cyan-500/10" />
            
            {/* Main Cap Circle */}
            <div className="relative z-10 h-28 w-28 bg-[#1a1a1a] border-2 border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.15)]">
               <GraduationCap size={48} className="text-cyan-400" strokeWidth={1.5} />
               
               {/* Checkmark Overlay */}
               <div className="absolute -bottom-1 -right-1 bg-[#050505] rounded-full p-1 border-2 border-white/10">
                  <CheckCircle2 size={24} className="text-white fill-current text-black" />
               </div>
            </div>
         </div>
      </div>

      {/* ── MAIN HEADING ── */}
      <div className="relative z-10 text-center space-y-2 mb-2">
        <h2 className="text-lg font-black leading-tight px-4 max-w-xs mx-auto">
          Your Doubt Has Been Submitted!
        </h2>
      </div>

      {/* ── INFO SUMMARY CARD ── */}
      <Card className="w-full max-w-md border-1 border-cyan-500/40 bg-white/[0.03] backdrop-blur-3xl rounded-lg shadow-[0_0_50px_rgba(34,211,238,0.05)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <CardContent className="p-8 py-1 space-y-2">
          
          {/* Row 1: Subject */}
          <DetailRow 
            icon={<Atom className="text-cyan-400" />} 
            label="Subject:" 
            value={data?.subject || "Loading..."} 
          />
          <Separator className="bg-white/10" />

          {/* Row 2: Chapter */}
          <DetailRow 
            icon={<Book className="text-purple-400" />} 
            label="Chapter:" 
            value={data?.chapter || "Loading..."} 
          />
          <Separator className="bg-white/10" />

          {/* Row 3: Mode */}
          <DetailRow 
            icon={<MessageSquare className="text-yellow-500" />} 
            label="Selected Mode:" 
            value={data?.mode || "Loading..."} 
          />

        </CardContent>
      </Card>

      {/* ── FOOTER NOTE ── */}
      <p className="mt-2 text-center text-xs text-white/40 leading-relaxed max-w-[280px] font-medium">
        Our expert tutor will review your doubt and provide a solution shortly (within {data?.estimatedTime}).
      </p>

      {/* ── ACTION BUTTON ── */}
      <div className="mt-auto w-full max-w-md pt-2 relative">
        <div className="absolute inset-0 bg-blue-600/30 blur-3xl rounded-full" />
        <Button
          onClick={() => navigate(PATHS.SESSION_HISTORY)}
          className={cn(
            "relative w-full h-12 rounded-full text-lg tracking-tight transition-all active:scale-[0.98]",
            "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white shadow-2xl"
          )}
        >
          Track Request
        </Button>
      </div>

    </div>
      </div>

  );
}

// ── Internal Row Component ──
function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 items-center">
       <div className="flex items-center gap-4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
             {icon}
          </div>
          <span className="text-sm font-medium text-white/50">{label}</span>
       </div>
       <span className="text-base    text-white text-right max-w-[140px] leading-tight">
          {value}
       </span>
    </div>
  );
}