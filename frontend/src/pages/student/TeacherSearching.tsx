import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, BookOpen, GraduationCap, Video, Phone, MessageCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
import { studentApi } from "@/lib/student-api";
import { toast } from "sonner";

export default function TeacherSearching() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    doubtId,
    sessionId,
    subjectName = "Mathematics",
    className = "Class 10th",
    sessionType = "Chat",
  } = location.state || {};

  const [statusMessage, setStatusMessage] = useState("Broadcasting to available teachers…");
  const [requestCount, setRequestCount] = useState(4);
  const [cancelled, setCancelled] = useState(false);
  const [noTeacher, setNoTeacher] = useState(false);

  // Socket: listen for session_accepted, request_missed, session_declined
  const { sessionAccepted, sessionMissed, sessionDeclined } = useSocket({ autoConnect: true });

  // Status message rotation
  useEffect(() => {
    const t1 = setTimeout(() => setStatusMessage("Matching teachers for your subject & class…"), 2000);
    const t2 = setTimeout(() => {
      setStatusMessage("Notifying nearby online teachers…");
      setRequestCount(3);
    }, 4500);
    const t3 = setTimeout(() => {
      setStatusMessage("Waiting for teacher to accept…");
      setRequestCount(2);
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // ── Handle session_accepted ─────────────────────────────────────────────
  useEffect(() => {
    if (!sessionAccepted || cancelled) return;
    const data = sessionAccepted;

    toast.success(`${data.teacherName} accepted! Connecting…`);
    setStatusMessage(`${data.teacherName} accepted your request! Connecting…`);

    setTimeout(() => {
      if (data.sessionType === "video") {
        navigate(PATHS.VIDEO_CALL_SESSION, {
          state: {
            sessionId: data.sessionId,
            agoraChannel: data.agoraChannel,
            sessionType: "video",
            teacher: {
              name: data.teacherName,
              photo: data.teacherPhoto,
              rating: data.teacherRating,
            },
            subjectName,
          },
        });
      } else if (data.sessionType === "audio") {
        navigate(PATHS.AUDIO_CALL, {
          state: {
            sessionId: data.sessionId,
            agoraChannel: data.agoraChannel,
            sessionType: "audio",
            teacher: {
              name: data.teacherName,
              photo: data.teacherPhoto,
            },
            subjectName,
          },
        });
      } else {
        navigate(PATHS.CHAT_SESSION, {
          state: {
            sessionId: data.sessionId,
            teacher: {
              name: data.teacherName,
              photo: data.teacherPhoto,
            },
            subjectName,
          },
        });
      }
    }, 1200);
  }, [sessionAccepted]);

  // ── Handle request_missed / session_declined ────────────────────────────
  useEffect(() => {
    if (sessionMissed || sessionDeclined) {
      setNoTeacher(true);
      setStatusMessage("No teachers available right now. Please try again.");
    }
  }, [sessionMissed, sessionDeclined]);

  const handleCancel = () => {
    setCancelled(true);
    navigate(PATHS.ASK_DOUBT);
  };

  const teachers = [
    { id: 1, name: "Teacher A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nerd", delay: 0 },
    { id: 2, name: "Teacher B", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Happy", delay: 0.5 },
    { id: 3, name: "Teacher C", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Screamer", delay: 1.0 },
    { id: 4, name: "Teacher D", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Blonde", delay: 1.5 },
  ];

  const sessionIcon = sessionType === "Video Call"
    ? <Video size={16} className="text-purple-400" />
    : sessionType === "Audio Call"
    ? <Phone size={16} className="text-green-400" />
    : <MessageCircle size={16} className="text-cyan-400" />;

  return (
    <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center px-6 pt-6 overflow-x-hidden pb-12", bgCss)}>

      {/* Background glows */}
      <div className="absolute top-[10%] left-[-20%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md flex-1 flex flex-col justify-between h-full z-10">

        {/* Header */}
        <header className="relative flex w-full items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-sm font-bold tracking-tight text-white/90">Finding Your Teacher</h1>
          <div className="w-10" />
        </header>

        {/* Status */}
        <div className="space-y-2 mt-4">
          <h2 className="text-2xl font-black tracking-tight text-left max-w-xs leading-snug">
            {noTeacher ? "No teachers available" : "Finding the best teacher for your doubt…"}
          </h2>
          <p className={cn(
            "text-xs font-semibold tracking-wide",
            noTeacher ? "text-red-400" : "text-cyan-400 animate-pulse"
          )}>
            {statusMessage}
          </p>
        </div>

        {/* Radar Animation */}
        <div className="relative flex items-center justify-center my-10 h-64 w-full">

          {/* Center VLM Logo */}
          <div className="relative z-20 h-28 w-28 rounded-full border border-cyan-400/40 bg-[#0f1d24] flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <span className="text-sm font-black tracking-widest text-cyan-400">VLM</span>
            <span className="text-[8px] font-black text-white/60 tracking-widest uppercase mt-0.5 leading-none">
              Doubt<br />Resolved
            </span>
          </div>

          {/* Spinning rings */}
          {!noTeacher && (
            <>
              <div className="absolute inset-0 m-auto h-40 w-40 border border-dashed border-cyan-500/25 rounded-full animate-spin [animation-duration:8s] pointer-events-none" />
              <div className="absolute inset-0 m-auto h-52 w-52 border border-dashed border-purple-500/25 rounded-full animate-spin [animation-duration:12s] pointer-events-none" />
            </>
          )}

          {/* Teacher avatars */}
          {teachers.map((teacher, index) => {
            const positions = ["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"];
            return (
              <motion.div
                key={teacher.id}
                animate={noTeacher ? { opacity: 0.3 } : { scale: [1, 1.05, 1], y: [0, -3, 0] }}
                transition={{ repeat: noTeacher ? 0 : Infinity, duration: 3, delay: teacher.delay }}
                className={cn("absolute z-20 flex flex-col items-center", positions[index])}
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-2 border-white/10 bg-neutral-900 overflow-hidden shadow-lg p-0.5">
                    <img src={teacher.avatar} alt={teacher.name} className="h-full w-full rounded-full object-cover" />
                  </div>
                  <span className={cn(
                    "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#050505]",
                    noTeacher ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  )} />
                </div>
              </motion.div>
            );
          })}

          {/* Request count banner */}
          <div className="absolute top-1/2 -translate-y-1/2 z-30 px-4 py-1.5 rounded-full border border-white/15 bg-black/80 backdrop-blur-md shadow-lg text-[9px] font-black tracking-wider uppercase text-white/95">
            {noTeacher
              ? <span className="flex items-center gap-1.5"><WifiOff size={10} /> No teachers found</span>
              : `Request sent to ${requestCount} teacher${requestCount > 1 ? "s" : ""}`
            }
          </div>
        </div>

        {/* Detail Card */}
        <Card className="border border-white/5 bg-white/[0.03] backdrop-blur-xl rounded-[1.5rem] overflow-hidden shadow-2xl shrink-0">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-cyan-400" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Subject</span>
                <span className="text-sm font-bold text-white block mt-0.5">{subjectName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <GraduationCap size={16} className="text-purple-400" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Class</span>
                <span className="text-sm font-bold text-white block mt-0.5">{className}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                {sessionIcon}
              </div>
              <div>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Session Type</span>
                <span className="text-sm font-bold text-white block mt-0.5">{sessionType}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="mt-6 w-full space-y-3">
          {noTeacher && (
            <Button
              onClick={() => navigate(PATHS.ASK_DOUBT)}
              className="w-full h-14 rounded-full text-xs font-black tracking-widest bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition-all"
            >
              Try Again
            </Button>
          )}
          <Button
            onClick={handleCancel}
            className="w-full h-14 rounded-full text-xs font-black tracking-widest border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-all"
          >
            Cancel Request
          </Button>
        </div>

      </div>
    </div>
  );
}
