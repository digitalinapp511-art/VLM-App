import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Mic, MicOff, Video, VideoOff, 
  Edit3, FileText, PhoneOff, User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { bgCss } from "@/helper/CssHelper";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionDetails, useStudentProfile } from "@/hooks/use-student";

export default function LiveSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = (location.state as { sessionId?: string })?.sessionId;
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(2732); // Initialized to ~45 mins 32 secs (2732 seconds) for realism matching the mockup

  const { data: session, isLoading } = useSessionDetails(sessionId);
  const { data: profile } = useStudentProfile();

  // Run session elapsed timer (incrementing)
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="min-h-svh bg-black flex items-center justify-center text-white font-mono">Connecting to stream...</div>;

  const topic = session?.topic ?? "CALCULUS 101";
  const teacher = session?.teacher?.fullName ?? "DR. SARAH JOHNSON,";
  const designation = session?.teacher?.qualification ?? "Math Faculty";
  const participant = profile?.fullName ?? profile?.nickname ?? "Aisha Gupta";

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const confirmEndSession = () => {
    navigate(PATHS.SESSION_FEEDBACK, { state: { sessionId: session?.id } });
  };

  return (
    <div className={cn("relative h-svh w-full text-white flex flex-col items-center overflow-hidden bg-[#080d19]", bgCss)}>
      
      {/* Background Glowing Decor */}
      <div className="absolute top-[10%] left-[-20%] h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[350px] w-[350px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Main Content constraints */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-between h-full z-10 overflow-hidden">

        {/* ── TOP HEADER (Dark capsule style matching the mockup) ── */}
        <header className="w-full px-4 pt-5 shrink-0">
          <div className="flex h-12 w-full items-center justify-between rounded-full border border-white/5 bg-[#121624]/65 px-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-white hover:bg-white/10 shrink-0" 
                onClick={() => setShowExitModal(true)}
              >
                <ChevronLeft size={18} />
              </Button>
              <h2 className="text-[10px] font-black tracking-widest uppercase text-white/90">
                LIVE SESSION: <span className="text-white">{topic}</span>
              </h2>
            </div>
            <div className="bg-[#242429]/90 px-3 py-1 rounded-full text-[10px] font-bold text-white/80 font-mono tracking-wide shrink-0 border border-white/5">
              {formatTimer(secondsElapsed)}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT (Picture in Picture & Serif Teacher name) ── */}
        <main className="relative flex-1 flex flex-col items-center justify-between w-full px-6 py-6">
          
          {/* Floating Student PIP Preview (Top Right) */}
          <div className="absolute top-2 right-6 h-32 w-24 border border-white/10 bg-[#161b2c] shadow-2xl rounded-2xl overflow-hidden z-20">
            <div className="h-full w-full bg-gradient-to-b from-[#1c223c] to-[#0c0f1d] flex items-center justify-center">
               <User size={32} className="text-white/20" />
            </div>
            <div className="absolute bottom-0 w-full bg-black/60 py-1 text-center backdrop-blur-sm">
              <p className="text-[8px] text-white/80 font-bold tracking-wide">{participant}</p>
            </div>
          </div>

          {/* Spacer to push name to bottom center area */}
          <div className="flex-1" />

          {/* Elegant Serif Teacher Name Display */}
          <div className="text-center mb-10 animate-in fade-in duration-1000 z-10 shrink-0">
            <h1 className="font-serif tracking-wide text-white uppercase text-2xl drop-shadow-md">
              {teacher}
            </h1>
            <p className="text-[10px] tracking-[0.15em] text-white/40 uppercase mt-1.5 font-bold">
              {designation}
            </p>
          </div>

        </main>

        {/* ── BOTTOM CONTROL PANEL (Gradient capsule style matching the mockup) ── */}
        <footer className="w-full shrink-0">
          <Card className="w-full border-t border-x border-white/5 bg-gradient-to-t from-[#0e071c]/95 to-[#1c0e34]/90 backdrop-blur-3xl rounded-t-[2.5rem] pb-8 pt-3 shadow-[0_-15px_30px_rgba(0,0,0,0.5)]">
            
            {/* Grab handle indicator */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/10" />

            <CardContent className="flex items-center justify-around px-2 py-0">
              
              <ControlItem 
                icon={micActive ? <Mic size={18} /> : <MicOff size={18} />} 
                label={micActive ? "MIC ON" : "MIC OFF"} 
                active={micActive}
                onClick={() => setMicActive(!micActive)}
              />

              <ControlItem 
                icon={camActive ? <Video size={18} /> : <VideoOff size={18} />} 
                label={camActive ? "CAM ON" : "CAM OFF"} 
                active={camActive}
                onClick={() => setCamActive(!camActive)}
              />

              <ControlItem 
                icon={<Edit3 size={18} />} 
                label="WHITEBOARD" 
                variant="blue"
                active
              />

              <ControlItem 
                icon={<FileText size={18} />} 
                label="FILES" 
              />

              <ControlItem
                icon={<PhoneOff className="rotate-[135deg]" size={18} />}
                label="END SESSION"
                variant="red"
                active
                onClick={() => setShowExitModal(true)}
              />

            </CardContent>
          </Card>
        </footer>

        {/* ── EXIT CONFIRMATION POPUP ── */}
        <AnimatePresence>
          {showExitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-lg p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-xs rounded-[2.5rem] border border-red-500/35 bg-white/[0.03] backdrop-blur-3xl p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col items-center gap-6"
              >
                <div className="h-16 w-16 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400 border border-cyan-500/20 text-2xl shadow-inner">
                  ⭐
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Are you sure you want to end this session?
                  </h3>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <Button
                    onClick={() => setShowExitModal(false)}
                    className="w-full h-12 rounded-full font-bold text-sm bg-white text-black hover:bg-white/90 border-none transition-all flex items-center justify-center gap-1.5"
                  >
                    ✓ CANCEL
                  </Button>
                  <Button
                    onClick={confirmEndSession}
                    className="w-full h-12 rounded-full font-bold text-sm bg-gradient-to-b from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white border border-red-400/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    ➜ END SESSION
                  </Button>
                </div>

                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  We priority match your review
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function ControlItem({ icon, label, variant, active, onClick }: any) {
  const variantStyles = {
    blue: "bg-[#2563eb] border-[#2563eb] hover:bg-blue-600 text-white",
    red: "bg-[#ef4444] border-[#ef4444] hover:bg-red-600 text-white",
    default: active 
      ? "bg-white/5 border-cyan-400/60 text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]" 
      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
  };

  const selectedStyle = variant ? variantStyles[variant as keyof typeof variantStyles] : variantStyles.default;

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <Button
        onClick={onClick}
        variant="outline"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-2xl border-2 transition-all duration-300 cursor-pointer active:scale-95",
          selectedStyle
        )}
      >
        {icon}
      </Button>
      <span className={cn(
        "text-[8px] font-black tracking-widest uppercase mt-0.5",
        active ? "text-white" : "text-white/40"
      )}>
        {label}
      </span>
    </div>
  );
}
