import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, BookOpen, GraduationCap, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function TeacherSearching() {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    doubtId, 
    sessionId,
    subjectName = "Mathematics", 
    className = "Class 10th", 
    sessionType = "Live Video Call" 
  } = location.state || {};

  const [statusMessage, setStatusMessage] = useState("Initializing matching service...");
  const [requestCount, setRequestCount] = useState(4);

  // Simulated status updates and auto-redirection
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatusMessage("Broadcasting request to active educators...");
    }, 2000);

    const timer2 = setTimeout(() => {
      setStatusMessage("Teacher found! Accepting connection request...");
      setRequestCount(1);
    }, 4500);

    const timer3 = setTimeout(() => {
      // Navigate to the final session route based on sessionType
      if (sessionType === "Audio Call") {
        navigate(PATHS.AUDIO_CALL, { state: { doubtId, sessionId } });
      } else if (sessionType === "Video Call") {
        navigate(PATHS.LIVE_SESSION, { state: { doubtId, sessionId } });
      } else {
        // Redirect to chat session screen
        navigate(PATHS.CHAT_SESSION, { state: { doubtId, sessionId: sessionId || "mock-session-123" } });
      }
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [sessionType, doubtId, navigate]);

  const handleCancel = () => {
    navigate(PATHS.ASK_DOUBT);
  };

  const teachers = [
    { id: 1, name: "Nerd Boy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nerd", delay: 0 },
    { id: 2, name: "Happy Girl", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Happy", delay: 0.5 },
    { id: 3, name: "Screaming Boy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Screamer", delay: 1.0 },
    { id: 4, name: "Blonde Girl", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Blonde", delay: 1.5 },
  ];

  return (
    <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center px-6 pt-6 overflow-x-hidden pb-12", bgCss)}>
      
      {/* Background Decor Glows */}
      <div className="absolute top-[10%] left-[-20%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md flex-1 flex flex-col justify-between h-full z-10">
        
        {/* ── HEADER ── */}
        <header className="relative flex w-full items-center justify-between mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-sm font-bold tracking-tight text-white/90">Teacher Searching</h1>
          <div className="w-10" />
        </header>

        {/* ── HEADING MESSAGE ── */}
        <div className="space-y-2 mt-4">
          <h2 className="text-2xl font-black tracking-tight text-left max-w-xs leading-snug">
            Finding the best teacher for your doubt...
          </h2>
          <p className="text-xs text-cyan-400 font-semibold tracking-wide animate-pulse">
            {statusMessage}
          </p>
        </div>

        {/* ── SEARCHING RADAR ANIMATION ── */}
        <div className="relative flex items-center justify-center my-10 h-64 w-full">
          
          {/* Centered Doubt Resolution Logo */}
          <div className="relative z-20 h-28 w-28 rounded-full border border-cyan-400/40 bg-[#0f1d24] flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <span className="text-sm font-black tracking-widest text-cyan-400">VLM</span>
            <span className="text-[8px] font-black text-white/60 tracking-widest uppercase mt-0.5 leading-none">
              Doubt<br/>Resolved
            </span>
          </div>

          {/* Glowing Animated Radar Rings */}
          <div className="absolute inset-0 m-auto h-40 w-40 border border-dashed border-cyan-500/25 rounded-full animate-spin [animation-duration:8s] pointer-events-none" />
          <div className="absolute inset-0 m-auto h-52 w-52 border border-dashed border-purple-500/25 rounded-full animate-spin [animation-duration:12s] pointer-events-none" />

          {/* Connecting Lines & Teachers Avatars */}
          {teachers.map((teacher, index) => {
            // Position angles (top-left, top-right, bottom-left, bottom-right)
            const positions = [
              "top-6 left-6",
              "top-6 right-6",
              "bottom-6 left-6",
              "bottom-6 right-6"
            ];
            return (
              <motion.div
                key={teacher.id}
                animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: teacher.delay }}
                className={cn("absolute z-20 flex flex-col items-center", positions[index])}
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-2 border-white/10 bg-neutral-900 overflow-hidden shadow-lg p-0.5">
                    <img src={teacher.avatar} alt={teacher.name} className="h-full w-full rounded-full object-cover" />
                  </div>
                  {/* Glowing Status Indicator */}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#050505] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
              </motion.div>
            );
          })}

          {/* Floating Sent Count Banner */}
          <div className="absolute top-1/2 -translate-y-1/2 z-30 px-4 py-1.5 rounded-full border border-white/15 bg-black/80 backdrop-blur-md shadow-lg text-[9px] font-black tracking-wider uppercase text-white/95">
            Request sent to {requestCount} teacher{requestCount > 1 ? 's' : ''}
          </div>

        </div>

        {/* ── DETAIL CARD ── */}
        <Card className="border border-white/5 bg-white/[0.03] backdrop-blur-xl rounded-[1.5rem] overflow-hidden shadow-2xl shrink-0">
          <CardContent className="p-5 space-y-4">
            
            {/* Subject */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Subject</span>
                <span className="text-sm font-bold text-white block mt-0.5">{subjectName}</span>
              </div>
            </div>

            {/* Class */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <GraduationCap size={16} className="text-purple-400" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Class</span>
                <span className="text-sm font-bold text-white block mt-0.5">{className}</span>
              </div>
            </div>

            {/* Session Type */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                <Video size={16} className="text-yellow-400" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Session Type</span>
                <span className="text-sm font-bold text-white block mt-0.5">{sessionType}</span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── CANCEL ACTION BUTTON ── */}
        <div className="mt-6 w-full">
          <Button
            onClick={handleCancel}
            className="w-full h-14 rounded-full text-xs font-black tracking-widest border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-all"
          >
            CANCEL REQUEST
          </Button>
        </div>

      </div>
    </div>
  );
}
