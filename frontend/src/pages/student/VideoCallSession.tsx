/**
 * VideoCallSession.tsx  — student side
 * Agora RTC video/audio call + HTML5 Collaborative Whiteboard
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, PenLine, Eraser, Trash2,
  ChevronLeft, Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const COLORS = ["#ffffff", "#22d3ee", "#a855f7", "#f59e0b", "#ef4444", "#10b981"];

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
  const localTrackRef = useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Whiteboard
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  // Socket
  const {
    remoteDrawAction, remoteClearCanvas, sendWhiteboardDraw, sendWhiteboardClear, sendCallEnd,
    callEnded,
  } = useSocket({ autoConnect: true, sessionId });

  // ── Agora join ──────────────────────────────────────────────────────────
  useEffect(() => {
    let localTracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null;

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

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = isAudioOnly ? null : await AgoraRTC.createCameraVideoTrack();

        if (videoTrack && localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        const tracks: any[] = [audioTrack];
        if (videoTrack) tracks.push(videoTrack);
        localTracks = videoTrack ? [audioTrack, videoTrack] : null;
        localTrackRef.current = localTracks;

        await agoraClient.publish(tracks);
        setJoined(true);
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      } catch (err: any) {
        console.error("Agora join failed:", err);
        toast.error("Failed to join call.");
      }
    };

    if (sessionId) joinChannel();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (localTrackRef.current) {
        localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
      }
      agoraClient?.leave().catch(() => {});
    };
  }, [sessionId]);

  useEffect(() => {
    if (callEnded) {
      toast.info("Session ended by teacher");
      handleEndCall(false);
    }
  }, [callEnded]);

  const handleEndCall = useCallback(async (emitEvent = true) => {
    if (emitEvent && sessionId) sendCallEnd(sessionId);
    if (timerRef.current) clearInterval(timerRef.current);
    localTrackRef.current?.forEach((t) => { t.stop(); t.close(); });
    await agoraClient?.leave().catch(() => {});
    navigate(PATHS.SESSION_FEEDBACK, { state: { sessionId, subjectName, duration } });
  }, [sessionId, duration, navigate]);

  const toggleMic = () => {
    localTrackRef.current?.[0]?.setMuted(!micMuted);
    setMicMuted(!micMuted);
  };

  const toggleCam = () => {
    if (isAudioOnly) return;
    (localTrackRef.current?.[1] as ICameraVideoTrack | undefined)?.setEnabled(camOff);
    setCamOff(!camOff);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ── HTML5 Canvas Whiteboard drawing logic ────────────────────────────────
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

  // Receive remote lines
  useEffect(() => {
    if (!remoteDrawAction || remoteDrawAction.type !== "line") return;
    const { x0, y0, x1, y1, color, width } = remoteDrawAction;
    drawLine(x0, y0, x1, y1, color, width, false);
  }, [remoteDrawAction]);

  // Receive remote clears
  useEffect(() => {
    if (remoteClearCanvas > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [remoteClearCanvas]);

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
    
    const color = activeTool === "eraser" ? "#0f172a" : activeColor;
    const width = activeTool === "eraser" ? 24 : 4;

    drawLine(lastX.current, lastY.current, currentX, currentY, color, width, true);

    lastX.current = currentX;
    lastY.current = currentY;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (sessionId) sendWhiteboardClear(sessionId);
    }
  };

  // Adjust canvas size inside the panel
  useEffect(() => {
    if (showWhiteboard && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 500;
    }
  }, [showWhiteboard]);

  return (
    <div className="relative min-h-svh w-full bg-[#050a14] text-white flex flex-col select-none">

      {/* TOP BAR */}
      <div className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-5 pt-5 pb-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarImage src={teacher?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher?.name || "Teacher"}`} />
            <AvatarFallback>{teacher?.name?.[0] || "T"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-black text-white leading-none">{teacher?.name || "Teacher"}</p>
            <p className="text-[10px] text-white/40 mt-0.5">
              {remoteJoined ? <span className="text-emerald-400">● Connected</span> : <span className="text-orange-400 animate-pulse">● Connecting…</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-black">
            {formatDuration(duration)}
          </div>
          <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-black text-red-400">
            ₹10/min
          </div>
        </div>
      </div>

      {/* VIDEO AREA */}
      <div className="flex-1 relative overflow-hidden">
        {!isAudioOnly ? (
          <>
            <div ref={remoteVideoRef} className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
              {!remoteJoined && (
                <p className="text-white/50 text-sm font-bold animate-pulse">Waiting for teacher to join…</p>
              )}
            </div>
            <div ref={localVideoRef} className="absolute bottom-32 right-4 z-30 h-32 w-24 rounded-2xl border border-white/10 overflow-hidden bg-zinc-800 shadow-2xl" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#050a14]">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={teacher?.photo} />
                <AvatarFallback>{teacher?.name?.[0] || "T"}</AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xl font-black text-white">{teacher?.name || "Teacher"}</p>
          </div>
        )}

        {/* Collaborative Whiteboard */}
        <AnimatePresence>
          {showWhiteboard && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-[#0f1f35] border-b border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTool("pen")}
                    className={cn("p-2 rounded-xl", activeTool === "pen" ? "bg-cyan-500 text-black" : "bg-white/5 text-white/60")}
                  ><PenLine size={16} /></button>
                  <button
                    onClick={() => setActiveTool("eraser")}
                    className={cn("p-2 rounded-xl", activeTool === "eraser" ? "bg-white text-black" : "bg-white/5 text-white/60")}
                  ><Eraser size={16} /></button>
                  <button onClick={clearCanvas} className="p-2 rounded-xl bg-red-500/10 text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setActiveTool("pen"); setActiveColor(c); }}
                      className={cn("h-6 w-6 rounded-full border-2 transition-all", activeColor === c ? "border-white scale-125" : "border-transparent")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={() => setShowWhiteboard(false)} className="p-2 rounded-xl bg-white/5 text-white/60">
                  <Minimize2 size={16} />
                </button>
              </div>
              <div className="flex-1 relative bg-[#0f172a]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 block cursor-crosshair"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTROLS */}
      <div className="relative z-40 bg-gradient-to-t from-black/90 to-transparent pb-8 pt-4 px-8">
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={toggleMic}
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center border transition-all",
              micMuted ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/10 border-white/10 text-white"
            )}
          >{micMuted ? <MicOff size={20} /> : <Mic size={20} />}</button>

          {!isAudioOnly && (
            <button
              onClick={() => setShowWhiteboard(true)}
              className="h-14 w-14 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center"
            ><PenLine size={20} /></button>
          )}

          <button
            onClick={() => handleEndCall(true)}
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
          ><PhoneOff size={22} /></button>

          {!isAudioOnly && (
            <button
              onClick={toggleCam}
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center border transition-all",
                camOff ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/10 border-white/10 text-white"
              )}
            >{camOff ? <VideoOff size={20} /> : <Video size={20} />}</button>
          )}
        </div>
      </div>
    </div>
  );
}
