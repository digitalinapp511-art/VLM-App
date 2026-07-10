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
import { studentApi } from "@/lib/student-api";

export default function TeacherSearching() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    doubtId,
    sessionId,
    subjectName = "Mathematics",
    className = "Class 10th",
    sessionType = "Chat",
    initialQuestion,
    initialImage,
    originalParams
  } = location.state || {};

  const [statusMessage, setStatusMessage] = useState("Broadcasting to available teachers…");
  const [requestCount, setRequestCount] = useState(4);
  const [cancelled, setCancelled] = useState(false);
  const [noTeacher, setNoTeacher] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
  }, [retryCount]);

  // ── Handle session_accepted ─────────────────────────────────────────────
  useEffect(() => {
    if (!sessionAccepted || cancelled || sessionAccepted.requestId !== doubtId) return;
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
            doubtId: (data as any).doubtId || doubtId,
            requestId: (data as any).doubtId || doubtId,
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
              gender: (data as any).teacherGender,
            },
            subjectName,
            doubtId: (data as any).doubtId || doubtId,
            requestId: (data as any).doubtId || doubtId,
          },
        });
      } else {
        navigate(PATHS.CHAT_SESSION, {
          state: {
            sessionId: data.sessionId,
            teacher: {
              name: data.teacherName,
              photo: data.teacherPhoto,
              gender: (data as any).teacherGender,
            },
            subjectName,
            doubtId: (data as any).doubtId || doubtId,
            requestId: (data as any).doubtId || doubtId,
            initialQuestion,
            initialImage,
          },
        });
      }
    }, 1200);
  }, [sessionAccepted]);

  // ── Handle request_missed / session_declined ────────────────────────────
  useEffect(() => {
    if (sessionMissed?.requestId === doubtId) {
      setNoTeacher(true);
      setStatusMessage("No teachers available right now. Please try again.");
    } else if (sessionDeclined?.requestId === doubtId) {
      setNoTeacher(true);
      setStatusMessage("Teacher declined the request. Please try again.");
    }
  }, [sessionMissed, sessionDeclined, doubtId]);

  const handleCancel = async () => {
    setCancelled(true);
    if (doubtId) {
      studentApi.cancelDoubtRequest(doubtId).catch((err) => console.error("Error cancelling request:", err));
    }
    navigate(PATHS.ASK_DOUBT);
  };

  const handleRetry = async () => {
    try {
      setNoTeacher(false);
      setStatusMessage("Broadcasting to available teachers…");
      setRequestCount(4);

      const payload = {
        subject: originalParams?.subject || subjectName,
        class: originalParams?.class || className.replace("Class ", "").replace("th", ""),
        board: originalParams?.board || "CBSE",
        language: originalParams?.language || "English",
        sessionType: originalParams?.sessionType || (sessionType === "Video Call" ? "video" : sessionType === "Audio Call" ? "audio" : "chat"),
        doubtText: originalParams?.doubtText || initialQuestion,
        topic: originalParams?.topic || "",
        doubtImage: originalParams?.doubtImage || initialImage
      };

      const result = await studentApi.createDoubt(payload);
      const newDoubtId = result?.data?.doubtRequest?._id || result?.data?.session?._id || result?.id;
      const newSessionId = result?.data?.session?._id;

      navigate(PATHS.TEACHER_SEARCHING, {
        state: {
          doubtId: newDoubtId,
          sessionId: newSessionId,
          subjectName,
          className,
          sessionType,
          initialQuestion,
          initialImage,
          originalParams
        },
        replace: true
      });
      
      // Trigger status rotation again without reloading the page
      setRetryCount(prev => prev + 1);
    } catch (err) {
      toast.error("Failed to retry request. Please try again.");
    }
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
    <div className="relative h-[100dvh] w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center px-6 py-6 overflow-hidden transition-colors duration-300 font-sans">

      <div className="w-full max-w-md flex-1 flex flex-col justify-between h-full z-10 overflow-hidden">

        {/* Header */}
        <header className="relative flex w-full items-center justify-between mb-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-600 dark:text-slate-400 shadow-sm hover:text-slate-800 dark:hover:text-white"
          >
            <ChevronLeft size={18} />
          </Button>
          <h1 className="text-xs font-black uppercase tracking-wider text-slate-450">Finding Your Teacher</h1>
          <div className="w-9" />
        </header>

        {/* Status */}
        <div className="space-y-1 text-center shrink-0">
          <h2 className="text-base font-black tracking-tight text-slate-850 dark:text-white leading-snug">
            {noTeacher ? "No teachers available" : "Finding the best teacher for your doubt…"}
          </h2>
          <p className={cn(
            "text-[10px] font-bold tracking-wide uppercase",
            noTeacher ? "text-rose-500" : "text-violet-600 dark:text-violet-400 animate-pulse"
          )}>
            {statusMessage}
          </p>
        </div>

        {/* Radar Animation */}
        <div className="relative flex-1 flex items-center justify-center min-h-[160px] max-h-[220px] w-full select-none my-4">

          {/* Center VLM Logo */}
          <div className="relative z-20 h-20 w-20 rounded-full border-2 border-violet-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] flex flex-col items-center justify-center text-center shadow-lg shadow-violet-500/5">
            <span className="text-sm font-black tracking-wider text-violet-600 dark:text-violet-400">VLM</span>
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5 leading-none">
              Doubt<br />Resolved
            </span>
          </div>

          {/* Spinning rings */}
          {!noTeacher && (
            <>
              <div className="absolute inset-0 m-auto h-28 w-28 border border-dashed border-violet-400/30 rounded-full animate-spin [animation-duration:8s] pointer-events-none" />
              <div className="absolute inset-0 m-auto h-36 w-36 border border-dashed border-indigo-400/30 rounded-full animate-spin [animation-duration:12s] pointer-events-none" />
            </>
          )}

          {/* Teacher avatars */}
          {teachers.map((teacher, index) => {
            const positions = ["top-2 left-8", "top-2 right-8", "bottom-2 left-8", "bottom-2 right-8"];
            return (
              <motion.div
                key={teacher.id}
                animate={noTeacher ? { opacity: 0.3 } : { scale: [1, 1.05, 1], y: [0, -3, 0] }}
                transition={{ repeat: noTeacher ? 0 : Infinity, duration: 3, delay: teacher.delay }}
                className={cn("absolute z-20 flex flex-col items-center", positions[index])}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-2 border-white dark:border-[#161233] bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-md p-0.5">
                    <img src={teacher.avatar} alt={teacher.name} className="h-full w-full rounded-full object-cover" />
                  </div>
                  <span className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white dark:border-[#161233]",
                    noTeacher ? "bg-rose-500" : "bg-emerald-500 shadow-md"
                  )} />
                </div>
              </motion.div>
            );
          })}

          {/* Request count banner */}
          <div className="absolute bottom-2 z-30 px-3 py-1 rounded-full border border-slate-700 bg-slate-800 shadow-lg text-[8px] font-black tracking-wider uppercase text-white">
            {noTeacher
              ? <span className="flex items-center gap-1.5"><WifiOff size={8} /> No teachers found</span>
              : `Request sent to ${requestCount} teacher${requestCount > 1 ? "s" : ""}`
            }
          </div>
        </div>

        {/* Compact 3-Column Detail Card */}
        <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] shadow-xs shrink-0 w-full mt-2">
          <CardContent className="p-3.5 grid grid-cols-3 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-800">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Subject</span>
              <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-full block mt-0.5">{subjectName}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Class</span>
              <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-full block mt-0.5">{className}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Type</span>
              <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-full block mt-0.5">{sessionType}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="mt-4 w-full space-y-2 shrink-0">
          {noTeacher && (
            <Button
              onClick={handleRetry}
              className="w-full h-12 rounded-2xl text-xs font-black tracking-widest bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white shadow-md border-none active:scale-95 transition-all cursor-pointer"
            >
              Try Again
            </Button>
          )}
          <Button
            onClick={handleCancel}
            className="w-full h-12 rounded-2xl text-xs font-black tracking-widest border border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            Cancel Request
          </Button>
        </div>

      </div>
    </div>
  );
}
