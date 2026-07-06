/**
 * TeacherSearching.tsx — student side
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigned to match the light, gamified VLM Academy dashboard theme.
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, BookOpen, GraduationCap, Video, Phone, MessageCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
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
    ? <Video size={16} className="text-purple-600" />
    : sessionType === "Audio Call"
    ? <Phone size={16} className="text-green-600" />
    : <MessageCircle size={16} className="text-cyan-600" />;

  const sessionIconBg = sessionType === "Video Call"
    ? "bg-purple-100"
    : sessionType === "Audio Call"
    ? "bg-green-100"
    : "bg-cyan-100";

  return (
    <div className="relative min-h-svh w-full bg-[#f4f6ff] text-slate-800 flex flex-col items-center px-6 pt-6 overflow-x-hidden pb-12 font-sans">

      <div className="w-full max-w-md flex-1 flex flex-col justify-between h-full z-10">

        {/* Header */}
        <header className="relative flex w-full items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-10 w-10 rounded-full border-slate-100 bg-white text-slate-600 shadow-sm hover:text-slate-800"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-sm font-bold tracking-tight text-slate-800">Finding Your Teacher</h1>
          <div className="w-10" />
        </header>

        {/* Status */}
        <div className="space-y-1.5 mt-4 text-center">
          <h2 className="text-xl font-black tracking-tight text-slate-800 leading-snug">
            {noTeacher ? "No teachers available" : "Finding the best teacher for your doubt…"}
          </h2>
          <p className={cn(
            "text-xs font-bold tracking-wide",
            noTeacher ? "text-red-500" : "text-violet-600 animate-pulse"
          )}>
            {statusMessage}
          </p>
        </div>

        {/* Radar Animation */}
        <div className="relative flex items-center justify-center my-8 h-64 w-full select-none">

          {/* Center VLM Logo */}
          <div className="relative z-20 h-28 w-28 rounded-full border-2 border-violet-100 bg-white flex flex-col items-center justify-center text-center shadow-lg shadow-violet-500/10">
            <span className="text-base font-black tracking-wider text-violet-600">VLM</span>
            <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase mt-0.5 leading-none">
              Doubt<br />Resolved
            </span>
          </div>

          {/* Spinning rings */}
          {!noTeacher && (
            <>
              <div className="absolute inset-0 m-auto h-40 w-40 border border-dashed border-violet-400/30 rounded-full animate-spin [animation-duration:8s] pointer-events-none" />
              <div className="absolute inset-0 m-auto h-52 w-52 border border-dashed border-indigo-400/30 rounded-full animate-spin [animation-duration:12s] pointer-events-none" />
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
                  <div className="h-14 w-14 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-md p-0.5">
                    <img src={teacher.avatar} alt={teacher.name} className="h-full w-full rounded-full object-cover" />
                  </div>
                  <span className={cn(
                    "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
                    noTeacher ? "bg-red-500" : "bg-emerald-500 shadow-md"
                  )} />
                </div>
              </motion.div>
            );
          })}

          {/* Request count banner */}
          <div className="absolute bottom-2 z-30 px-4 py-1.5 rounded-full border border-slate-700 bg-slate-800 shadow-lg text-[9px] font-black tracking-wider uppercase text-white">
            {noTeacher
              ? <span className="flex items-center gap-1.5"><WifiOff size={10} /> No teachers found</span>
              : `Request sent to ${requestCount} teacher${requestCount > 1 ? "s" : ""}`
            }
          </div>
        </div>

        {/* Detail Card */}
        <Card className="border border-slate-100 bg-white rounded-3xl shadow-sm shrink-0">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-violet-600" />
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Subject</span>
                <span className="text-sm font-bold text-slate-800 block mt-0.5">{subjectName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <GraduationCap size={16} className="text-indigo-600" />
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Class</span>
                <span className="text-sm font-bold text-slate-800 block mt-0.5">{className}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", sessionIconBg)}>
                {sessionIcon}
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Session Type</span>
                <span className="text-sm font-bold text-slate-800 block mt-0.5">{sessionType}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="mt-6 w-full space-y-3">
          {noTeacher && (
            <Button
              onClick={() => navigate(PATHS.ASK_DOUBT)}
              className="w-full h-14 rounded-2xl text-xs font-black tracking-widest bg-gradient-to-r from-violet-600 to-indigo-700 text-white transition-all shadow-md shadow-violet-500/10"
            >
              Try Again
            </Button>
          )}
          <Button
            onClick={handleCancel}
            className="w-full h-14 rounded-2xl text-xs font-black tracking-widest border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            Cancel Request
          </Button>
        </div>

      </div>
    </div>
  );
}
