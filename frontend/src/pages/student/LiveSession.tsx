import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Mic, MicOff, Video, VideoOff, 
  Edit3, FileText, PhoneOff, User 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSessionDetails } from "@/hooks/use-student";
import { useStudentProfile } from "@/hooks/use-student";

export default function LiveSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = (location.state as { sessionId?: string })?.sessionId;
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(false);

  const { data: session, isLoading } = useSessionDetails(sessionId);
  const { data: profile } = useStudentProfile();

  if (isLoading) return <div className="min-h-svh bg-black flex items-center justify-center text-white font-mono">Connecting to stream...</div>;

  const topic = session?.topic ?? "Live Session";
  const teacher = session?.teacher?.fullName ?? "Your Teacher";
  const designation = session?.teacher?.qualification ?? "Faculty";
  const participant = profile?.fullName ?? profile?.nickname ?? "Student";
  const initialTime = session?.startedAt
    ? new Date(session.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : "00:00";

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#0a0f1d] overflow-hidden text-white font-sans">
      <div className="max-w-xl w-full flex flex-col min-h-svh">

      {/* ── TOP HEADER ── */}
      <header className="relative z-20 w-full max-w-2xl px-6 pt-6">
        <div className="flex h-10 items-center justify-between rounded-full border border-white/10 bg-black/40 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/10" onClick={() => navigate(PATHS.LIVE_CLASSES)}>
              <ChevronLeft size={20} />
            </Button>
            <h2 className="text-xs font-black tracking-widest uppercase opacity-90">
              LIVE SESSION: <span className="text-white">{topic}</span>
            </h2>
          </div>
          <Badge className="bg-white/10 text-white/80 font-mono text-[11px] px-3 py-1 rounded-full border-none">
            {initialTime}
          </Badge>
        </div>
      </header>

      {/* ── MAIN CONTENT (Video Area) ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center w-full px-6">
        
        <Card className="absolute top-10 right-6 h-35 w-20 border-white/10 bg-[#1a1a1a] shadow-2xl rounded-lgoverflow-hidden">
          <div className="h-full w-full bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center">
             <User size={40} className="text-white/20" />
          </div>
          <div className="absolute bottom-0 w-full bg-black/60 py-1 text-center backdrop-blur-sm">
            <p className="text-[9px]   text-white/80">{participant}</p>
          </div>
        </Card>

        <div className="mt-auto mb-40 text-center  animate-in fade-in duration-1000">
          <h1 className=" font-serif tracking-widest text-white uppercase drop-shadow-lg">
            {teacher},
          </h1>
          <p className="text-xs   tracking-[0.1em] text-white/40 uppercase">
            {designation}
          </p>
        </div>
      </main>

      {/* ── BOTTOM CONTROL PANEL ── */}
     <footer className="mt-auto z-20 w-full bg-gradient-to-t from-[#1a0b2e] to-transparent">
        <Card className="mx-auto gap-1 w-full max-w-2xl border-none bg-[#160d26]/80 backdrop-blur-3xl rounded-t-[3rem] pb-8 pt-3">
          
          <div className="mx-auto mb-8 h-1.5 w-10 rounded-full bg-white/20" />

          <CardContent className="flex  items-center justify-around px-0 py-0">
            
            <ControlItem 
              icon={micActive ? <Mic /> : <MicOff />} 
              label={micActive ? "MIC ON" : "MIC OFF"} 
              onClick={() => setMicActive(!micActive)}
            />

            <ControlItem 
              icon={camActive ? <Video /> : <VideoOff />} 
              label={camActive ? "CAM ON" : "CAM OFF"} 
              onClick={() => setCamActive(!camActive)}
            />

            <ControlItem 
              icon={<Edit3 />} 
              label="WHITEBOARD" 
              variant="blue"
              active
            />

            <ControlItem 
              icon={<FileText />} 
              label="FILES" 
            />

            <ControlItem
              icon={<PhoneOff className="rotate-[135deg]" />}
              label="END SESSION"
              variant="red"
              active
              onClick={() => navigate(PATHS.SESSION_FEEDBACK, { state: { sessionId: session?.id } })}
            />

          </CardContent>
        </Card>
      </footer>
    </div>
      </div>

  );
}

function ControlItem({ icon, label, variant, active, onClick }: any) {
  const variantStyles = {
    blue: "bg-[#2563eb] border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]  text-white",
    red: "bg-[#ef4444] border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]  text-white",
    default: "bg-white/10 border-white/5 text-white/60 hover:bg-white/20  text-white"
  };

  const selectedStyle = variant ? variantStyles[variant as keyof typeof variantStyles] : variantStyles.default;

  return (
    <div className="flex  flex-col items-center gap-3">
      <Button
        onClick={onClick}
        variant="outline"
        size="icon"
        className={cn(
          "h-13 w-13 rounded-lg border-2 bg-white transition-all duration-300",
          selectedStyle
        )}
      >
        {icon}
      </Button>
      <span className={cn(
        "text-[9px] font-black tracking-widest uppercase",
        active ? "text-white" : "text-white/40"
      )}>
        {label}
      </span>
    </div>
  );
}
