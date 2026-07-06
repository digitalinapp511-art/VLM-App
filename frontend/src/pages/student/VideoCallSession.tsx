/**
 * VideoCallSession.tsx  — student side
 * Agora RTC video/audio call + HTML5 Collaborative Whiteboard
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, PenLine, Eraser, Trash2,
  Minimize2, ChevronLeft, Undo, Redo, Pencil, FileText, PenTool
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { useSocket } from "@/hooks/use-socket";
import { studentApi } from "@/lib/student-api";
import { motion, AnimatePresence } from "framer-motion";

let agoraClient: IAgoraRTCClient | null = null;

const COLORS = ["#0f172a", "#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

export default function VideoCallSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sessionId,
    agoraChannel,
    sessionType = "video",
    teacher,
    subjectName = "Mathematics",
  } = location.state || {};

  const isAudioOnly = sessionType === "audio";

  const [joined, setJoined] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [duration, setDuration] = useState(0);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localTrackRef = useRef<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Whiteboard
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [activeTool, setActiveTool] = useState<"pen" | "pencil" | "eraser">("pen");
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  // Undo/Redo history
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Socket
  const {
    remoteDrawAction, remoteClearCanvas, remoteWhiteboardToggle, sendWhiteboardDraw, sendWhiteboardClear, sendCallEnd,
    callEnded,
  } = useSocket({ autoConnect: true, sessionId });

  // ── Agora join ──────────────────────────────────────────────────────────
  useEffect(() => {
    const joinChannel = async () => {
      try {
        const tokenData = await studentApi.getAgoraToken(sessionId);
        const { token, channelName, appId } = tokenData;

        agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        agoraClient.on("user-published", async (user, mediaType) => {
          await agoraClient!.subscribe(user, mediaType);
          setRemoteJoined(true);
          if (mediaType === "video" && remoteVideoRef.current && !isAudioOnly) {
            user.videoTrack?.play(remoteVideoRef.current);
          }
          if (mediaType === "audio") user.audioTrack?.play();
        });

        agoraClient.on("user-left", () => setRemoteJoined(false));

        await agoraClient.join(appId, channelName, token, null);

        let audioTrack: any = null;
        let videoTrack: any = null;

        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        } catch (e) {
          toast.error("Microphone access is required to join the call.");
          throw e;
        }

        if (!isAudioOnly) {
          try {
            videoTrack = await AgoraRTC.createCameraVideoTrack();
            if (localVideoRef.current) {
              videoTrack.play(localVideoRef.current);
            }
          } catch (e) {
            toast.warn("Camera failed to start. Continuing with audio only.");
          }
        }

        const tracks: any[] = [];
        if (audioTrack) {
          tracks.push(audioTrack);
          localTrackRef.current.push(audioTrack);
        }
        if (videoTrack) {
          tracks.push(videoTrack);
          localTrackRef.current.push(videoTrack);
        }

        await agoraClient.publish(tracks);
        setJoined(true);
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      } catch (err: any) {
        console.error("Agora join failed (student):", err);
        toast.error("Failed to join call: " + (err.message || String(err)));
      }
    };

    if (sessionId) joinChannel();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
      localTrackRef.current = [];
      agoraClient?.leave().catch(() => {});
    };
  }, [sessionId]);

  useEffect(() => {
    if (callEnded) {
      toast.info("Teacher ended the session");
      handleEndCall(false);
    }
  }, [callEnded]);

  const handleEndCall = useCallback(async (emitEvent = true) => {
    if (emitEvent && sessionId) sendCallEnd(sessionId);
    if (timerRef.current) clearInterval(timerRef.current);
    localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
    localTrackRef.current = [];
    await agoraClient?.leave().catch(() => {});
    navigate(PATHS.SESSION_FEEDBACK, { state: { sessionId, subjectName, duration } });
  }, [sessionId, duration, navigate]);

  const toggleMic = () => {
    const audioTrack = localTrackRef.current.find(t => t.trackMediaType === "audio");
    if (audioTrack) {
      audioTrack.setMuted(!micMuted);
      setMicMuted(!micMuted);
    } else {
      toast.error("No active microphone track found.");
    }
  };

  const toggleCam = async () => {
    if (isAudioOnly) return;
    const videoTrack = localTrackRef.current.find(t => t.trackMediaType === "video");
    if (videoTrack) {
      videoTrack.setEnabled(camOff);
      setCamOff(!camOff);
    } else {
      // Attempt to reacquire camera track dynamically
      try {
        toast.info("Attempting to access camera...");
        const newVideoTrack = await AgoraRTC.createCameraVideoTrack();
        localTrackRef.current.push(newVideoTrack);
        if (localVideoRef.current) {
          newVideoTrack.play(localVideoRef.current);
        }
        await agoraClient?.publish([newVideoTrack]);
        setCamOff(false);
        toast.success("Camera turned ON!");
      } catch (err: any) {
        toast.error("Failed to start camera: " + (err.message || String(err)));
      }
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Whiteboard drawing logic ───────────────────────────────────────────
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, dataUrl]);
    setHistoryStep(newHistory.length);
  };

  const drawLine = (x0: number, y0: number, x1: number, y1: number, color: string, width: number, emit = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    if (emit && sessionId) {
      sendWhiteboardDraw(sessionId, {
        type: "line",
        x0, y0, x1, y1,
        color,
        width
      });
    }
  };

  useEffect(() => {
    if (!remoteDrawAction || remoteDrawAction.type !== "line") return;
    const { x0, y0, x1, y1, color, width } = remoteDrawAction;
    drawLine(x0, y0, x1, y1, color, width, false);
  }, [remoteDrawAction]);

  useEffect(() => {
    if (remoteClearCanvas > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
      }
    }
  }, [remoteClearCanvas]);

  // Receive remote whiteboard toggle (open/close) from teacher
  useEffect(() => {
    if (remoteWhiteboardToggle) {
      setShowWhiteboard(remoteWhiteboardToggle.show);
    }
  }, [remoteWhiteboardToggle]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    lastX.current = clientX - rect.left;
    lastY.current = clientY - rect.top;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;
    
    const color = activeTool === "eraser" ? "#ffffff" : activeColor;
    const width = activeTool === "eraser" ? 24 : activeTool === "pencil" ? 2 : 4;

    drawLine(lastX.current, lastY.current, currentX, currentY, color, width, true);

    lastX.current = currentX;
    lastY.current = currentY;
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveState();
      if (sessionId) sendWhiteboardClear(sessionId);
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const prevStep = historyStep - 1;
      const img = new Image();
      img.src = history[prevStep];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryStep(prevStep);
      };
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const nextStep = historyStep + 1;
      const img = new Image();
      img.src = history[nextStep];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryStep(nextStep);
      };
    }
  };

  useEffect(() => {
    if (showWhiteboard && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 500;
      // Initialize starting history state
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      saveState();
    }
  }, [showWhiteboard]);

  return (
    <div className="relative min-h-svh w-full bg-[#0b1329] text-white flex flex-col select-none overflow-hidden font-sans">
      
      <AnimatePresence mode="wait">
        {!showWhiteboard ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#0b1329]/80 backdrop-blur-md border-b border-white/5">
              <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-cyan-400 font-bold">
                <ChevronLeft size={18} />
                LIVE SESSION: {subjectName.toUpperCase()}
              </button>
              <div className="px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs font-black text-cyan-400 shadow-md">
                {formatDuration(duration)}
              </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative flex items-center justify-center">
              {!isAudioOnly && !camOff ? (
                <div ref={localVideoRef} className="absolute inset-0 bg-[#060b18] flex items-center justify-center" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <p className="text-2xl font-black tracking-wide text-white uppercase">{teacher?.name || "Teacher"}</p>
                  <p className="text-sm font-semibold text-cyan-400/60 uppercase">Faculty</p>
                </div>
              )}

              {/* Floating Teacher Video (Top Right) */}
              {remoteJoined && !isAudioOnly && (
                <div className="absolute top-5 right-5 z-30 h-44 w-32 rounded-2xl border-2 border-cyan-500/20 overflow-hidden bg-[#060b18] shadow-2xl flex flex-col justify-end">
                  <div ref={remoteVideoRef} className="absolute inset-0" />
                  <div className="relative z-10 bg-black/60 py-1.5 px-3 text-[10px] font-black text-white text-center border-t border-white/5">
                    {teacher?.name || "Teacher"}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel (Purple Gradient Controls Bar) */}
            <div className="bg-gradient-to-t from-purple-950/80 to-[#0b1329] pt-6 pb-8 px-6 border-t border-purple-500/10">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">
                {/* MIC Toggle */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={toggleMic}
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all shadow-lg",
                      micMuted ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/10 border-white/10 text-white"
                    )}
                  >
                    {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">
                    {micMuted ? "Mic Off" : "Mic On"}
                  </span>
                </div>

                {/* CAM Toggle */}
                {!isAudioOnly && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={toggleCam}
                      className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all shadow-lg",
                        camOff ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/10 border-white/10 text-white"
                      )}
                    >
                      {camOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">
                      {camOff ? "Cam Off" : "Cam On"}
                    </span>
                  </div>
                )}

                {/* Dummy FILES Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => toast.info("File sharing is disabled locally.")}
                    className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-all shadow-lg"
                  >
                    <FileText size={20} />
                  </button>
                  <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">Files</span>
                </div>

                {/* END SESSION Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleEndCall(true)}
                    className="h-14 w-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:bg-red-600 transition-all"
                  >
                    <PhoneOff size={20} />
                  </button>
                  <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">End Call</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Mockup 1: Whiteboard Screen Layout ── */
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="flex-1 bg-white text-slate-800 flex flex-col relative"
          >
            {/* Whiteboard Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-sm text-cyan-600 font-bold">
                LIVE SESSION | {subjectName.toUpperCase()}
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                {formatDuration(duration)}
              </div>
            </div>

            {/* Drawing Canvas Area */}
            <div className="flex-1 relative bg-slate-50 overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 block cursor-crosshair bg-white"
              />

              {/* Floating Faculty Card (Top Right) */}
              <div className="absolute top-5 right-5 z-30 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-2xl flex flex-col items-center text-center w-48 space-y-2.5">
                <Avatar className="h-16 w-16 border-2 border-cyan-500/30">
                  <AvatarImage src={teacher?.photo} />
                  <AvatarFallback>{teacher?.name?.[0] || "T"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-black text-slate-900 tracking-wide">{teacher?.name || "Teacher"}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Faculty</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-[9px] font-extrabold text-slate-500 flex items-center gap-1">
                  STUDENTS: 24 ONLINE
                </div>
              </div>
            </div>

            {/* Floating toolbar (Pencil, Pen, Eraser, Separator, Undo, Redo + Color Palette) */}
            <div className="absolute bottom-6 inset-x-0 z-40 px-6 flex justify-center pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md py-4 px-6 rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col items-center gap-3.5 pointer-events-auto max-w-md w-full">
                {/* Toolbar Items */}
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => setActiveTool("pen")}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      activeTool === "pen" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <PenTool size={18} />
                  </button>
                  <button
                    onClick={() => setActiveTool("pencil")}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      activeTool === "pencil" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setActiveTool("eraser")}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      activeTool === "eraser" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Eraser size={18} />
                  </button>

                  <div className="w-px h-6 bg-slate-200" />

                  <button
                    onClick={handleUndo}
                    disabled={historyStep <= 0}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Undo size={18} />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyStep >= history.length - 1}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Redo size={18} />
                  </button>
                  <button onClick={clearCanvas} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-4">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        if (activeTool === "eraser") setActiveTool("pen");
                        setActiveColor(c);
                      }}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                        activeColor === c && activeTool !== "eraser" ? "border-slate-800 scale-125 shadow-md" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
