/**
 * TeacherVideoSession.tsx — teacher side
 * Agora RTC video/audio call + HTML5 Collaborative Whiteboard
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, PenLine, Eraser, Trash2,
  Minimize2, ChevronLeft, Undo, Redo, Pencil, FileText, PenTool,
  ShieldCheck, MessageSquare, Volume2, VolumeX, Paperclip
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

// Suppress Agora verbose DEBUG logs in production (0=DEBUG 1=INFO 2=WARNING 3=ERROR 4=NONE)
AgoraRTC.setLogLevel(import.meta.env.DEV ? 2 : 4);
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
import { teacherApi } from "@/lib/teacher-api";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import ConnectionVisualizer from "@/components/basic/teacher/ConnectionVisualizer";
import AudioWaveform from "@/components/basic/teacher/AudioWaveform";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const COLORS = ["#0f172a", "#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

export default function TeacherVideoSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sessionId,
    agoraChannel,
    sessionType = "video",
    student,
    subjectName = "Mathematics",
  } = location.state || {};

  const isAudioOnly = sessionType === "audio";

  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);

  const [currentStudent, setCurrentStudent] = useState<any>(student);
  const [currentRequestId, setCurrentRequestId] = useState<string>("");

  const [joined, setJoined] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [duration, setDuration] = useState(0);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localTrackRef = useRef<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch session details on mount to sync timer and ensure we have correct student details & doubt ID
  useEffect(() => {
    if (!sessionId) return;
    apiClient.get(`/sessions/${sessionId}`)
      .then(res => {
        if (res.data?.success && res.data.data) {
          const s = res.data.data;
          if (s.studentId) {
            setCurrentStudent({
              name: s.studentId.nickname || s.studentId.fullName,
              photo: s.studentId.profilePhoto,
              class: s.studentId.class
            });
          }
          if (s.doubtRequestId) {
            setCurrentRequestId(s.doubtRequestId);
          }
          if (typeof s.elapsedSeconds === "number") {
            setDuration(s.elapsedSeconds);
          } else if (s.startedAt) {
            const elapsed = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
            setDuration(Math.max(0, elapsed));
          }
        }
      })
      .catch(err => console.error("Error loading session details:", err));
  }, [sessionId]);

  const toggleSpeaker = () => {
    const newState = !isSpeaker;
    setIsSpeaker(newState);
    if (agoraClientRef.current) {
      agoraClientRef.current.remoteUsers.forEach((user) => {
        if (user.audioTrack) {
          if (newState) {
            user.audioTrack.play();
          } else {
            user.audioTrack.stop();
          }
        }
      });
    }
  };

  // Live Chat
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    remoteDrawAction, remoteClearCanvas, sendWhiteboardDraw, sendWhiteboardClear, sendCallEnd,
    sendWhiteboardToggle, callEnded, sendMessage, lastMessage
  } = useSocket({ autoConnect: true, sessionId });

  useEffect(() => {
    if (lastMessage) {
      setMessages((prev) => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendMessage({ sessionId, content: chatInput });
    setChatInput("");
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading attachment...");
    try {
      const formData = new FormData();
      formData.append("media", file);
      const res = await teacherApi.uploadChatMedia(formData);
      if (res && res.url) {
        sendMessage({
          sessionId,
          content: `Sent an attachment: ${file.name}`,
          type: "media",
          mediaUrl: res.url
        });
        toast.success("Attachment sent!", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Error uploading file", { id: toastId });
    }
  };

  // ── Agora join ──────────────────────────────────────────────────────────
  useEffect(() => {
    let client: IAgoraRTCClient | null = null;

    const joinChannel = async () => {
      try {
        const tokenData = await teacherApi.getAgoraToken(sessionId);
        const { token, channelName, appId } = tokenData;

        toast.info("Agora client initializing...");
        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        agoraClientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          if (!client) return;
          await client.subscribe(user, mediaType);
          setRemoteJoined(true);
          if (mediaType === "video" && remoteVideoRef.current && !isAudioOnly) {
            user.videoTrack?.play(remoteVideoRef.current);
          }
          if (mediaType === "audio") {
            if (isSpeaker) {
              user.audioTrack?.play();
            }
          }
        });

        client.on("user-left", () => setRemoteJoined(false));

        toast.info("Joining channel...");
        await client.join(appId, channelName, token, null);
        toast.info("Agora joined. Requesting microphone...");

        let audioTrack: any = null;
        let videoTrack: any = null;

        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          toast.info("Microphone acquired.");
        } catch (e) {
          toast.error("Microphone access is required to join the call.");
          throw e;
        }

        if (!isAudioOnly) {
          try {
            videoTrack = await AgoraRTC.createCameraVideoTrack();
            toast.info("Camera acquired.");
            if (localVideoRef.current) {
              videoTrack.play(localVideoRef.current);
            }
          } catch (e) {
            toast.error("Camera failed to start. Continuing with audio only.");
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

        await client.publish(tracks);
        toast.success("Joined call successfully!");
        setJoined(true);
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      } catch (err: any) {
        console.error("Agora join failed (teacher):", err);
        toast.error("Failed to join call: " + (err.message || String(err)));
      }
    };

    if (sessionId) joinChannel();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
      localTrackRef.current = [];
      const activeClient = agoraClientRef.current;
      if (activeClient) {
        activeClient.leave().catch(() => {});
      }
      agoraClientRef.current = null;
      client = null;
    };
  }, [sessionId]);

  // Ensure local video track plays when the element mounts or cam state toggles
  useEffect(() => {
    if (!isAudioOnly && !camOff && localVideoRef.current) {
      const videoTrack = localTrackRef.current.find(t => t.trackMediaType === "video");
      if (videoTrack) {
        videoTrack.play(localVideoRef.current);
      }
    }
  }, [camOff, joined, localVideoRef.current]);

  // Ensure remote video track plays when the element mounts or remote joined status updates
  useEffect(() => {
    if (!isAudioOnly && remoteJoined && remoteVideoRef.current && agoraClientRef.current) {
      const remoteUsers = agoraClientRef.current.remoteUsers;
      for (const user of remoteUsers) {
        if (user.videoTrack) {
          user.videoTrack.play(remoteVideoRef.current);
        }
      }
    }
  }, [remoteJoined, joined, showWhiteboard, remoteVideoRef.current]);

  useEffect(() => {
    if (callEnded) {
      toast.info("Student ended the session");
      handleEndCall(false);
    }
  }, [callEnded]);

  const handleEndCall = useCallback(async (emitEvent = true) => {
    if (emitEvent && sessionId) sendCallEnd(sessionId);
    if (timerRef.current) clearInterval(timerRef.current);
    localTrackRef.current.forEach((t) => { t.stop(); t.close(); });
    localTrackRef.current = [];
    await agoraClientRef.current?.leave().catch(() => {});
    try {
      await teacherApi.endSession(sessionId, {});
    } catch { /* ignore */ }
    toast.success("Session completed!");
    navigate(PATHS.TEACHER_RESOLVE_DOUBT, {
      state: {
        sessionId,
        studentName: currentStudent?.name || "Student",
        subjectName,
        teacherName: "You",
        role: "Faculty",
      }
    });
  }, [sessionId, currentStudent, navigate]);

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
        await agoraClientRef.current?.publish([newVideoTrack]);
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

  const earnings = Math.floor(duration / 60) * 10;

  return (
    <div className="dark relative flex min-h-svh w-full flex-col bg-[#0b081e] text-white overflow-hidden font-sans">
      
      {/* ── Mockup 2: Video Call Screen Layout ── */}
      <AnimatePresence mode="wait">
        {!showWhiteboard ? (
          isAudioOnly ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md flex-1 flex flex-col justify-between h-full px-6 pt-6 pb-6 z-10 overflow-hidden mx-auto"
            >
              {/* Header */}
              <header className="relative flex w-full items-center justify-between shrink-0">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl border-slate-800 bg-[#161233] text-white hover:bg-slate-900 active:scale-95 transition-all shadow-sm" 
                  onClick={() => handleEndCall(true)}
                >
                  <ChevronLeft size={20} />
                </Button>
                <h1 className="text-sm font-black tracking-tight uppercase text-white">Audio Class</h1>
                <div className="w-10" />
              </header>

              {/* Participant details block */}
              <div className="relative w-full max-w-[340px] mx-auto mt-12 mb-4 shrink-0">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                  <Avatar className="h-20 w-20 border-4 border-[#0b081e] ring-2 ring-violet-500/20 shadow-2xl">
                    <AvatarImage src={currentStudent?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentStudent?.name || "Student"}`} />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                </div>

                <Card className="border border-slate-800 bg-[#161233] rounded-[2rem] pt-14 pb-6 shadow-sm">
                  <CardContent className="flex flex-col items-center text-center space-y-1.5 p-4 text-white">
                    <h2 className="text-base font-black tracking-wide text-white">{currentStudent?.name || "Student User"}</h2>
                    <p className="text-xs font-bold text-slate-350">{currentStudent?.class ? `Class ${currentStudent.class}` : "Class 12"}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      Doubt ID: {currentRequestId ? currentRequestId.slice(-6).toUpperCase() : "#VLM-CALL"}
                    </p>

                    <div className="w-full py-2.5 px-4">
                      <Separator className="bg-slate-800" />
                    </div>

                    <p className="text-[11px] text-slate-400 tracking-wide font-bold leading-relaxed">
                      {subjectName ?? "Doubt Question Details"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Waveform and Timer */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] shrink-0">
                <div className="space-y-0.5 text-center mb-1">
                  <p className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase">Voice Connection Active</p>
                  <h3 className="text-3xl font-black tracking-wider text-white">
                    {formatDuration(duration)}
                  </h3>
                </div>

                <div className="h-16 w-full max-w-[240px]">
                  <svg viewBox="0 0 200 60" className="w-full h-full opacity-60">
                    <path
                      d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                    <path
                      d="M0 40 Q 30 20, 60 40 T 120 40 T 180 40"
                      fill="none"
                      stroke="#db2777"
                      strokeWidth="2.5"
                      className="animate-pulse"
                      style={{ animationDelay: '0.5s' }}
                    />
                  </svg>
                </div>
              </div>

              {/* Control Buttons */}
              <Card className="w-full max-w-[360px] mx-auto border border-slate-800 bg-[#161233] rounded-[2rem] py-4 shadow-sm shrink-0">
                <CardContent className="flex items-center justify-around p-0">
                  {/* MUTE */}
                  <div className="flex flex-col justify-center items-center space-y-2 shrink-0">
                    <button
                      onClick={toggleMic}
                      className={cn(
                        "h-14 w-14 rounded-full border-2 flex flex-col justify-center items-center transition-all duration-350 active:scale-95 cursor-pointer",
                        micMuted 
                          ? "border-rose-500 bg-rose-500/10 text-rose-500" 
                          : "border-cyan-400 bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                      )}
                    >
                      {micMuted ? <MicOff size={20} className="stroke-[2.5px]" /> : <Mic size={20} className="stroke-[2.5px]" />}
                    </button>
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">Mute</span>
                  </div>

                  {/* SPEAKER */}
                  <div className="flex flex-col justify-center items-center space-y-2 shrink-0">
                    <button
                      onClick={toggleSpeaker}
                      className={cn(
                        "h-14 w-14 rounded-full border-2 flex flex-col justify-center items-center transition-all duration-350 active:scale-95 cursor-pointer",
                        !isSpeaker 
                          ? "border-rose-500 bg-rose-500/10 text-rose-500" 
                          : "border-cyan-400 bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                      )}
                    >
                      {isSpeaker ? <Volume2 size={20} className="stroke-[2.5px]" /> : <VolumeX size={20} className="stroke-[2.5px]" />}
                    </button>
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">Speaker</span>
                  </div>

                  {/* CHAT Toggle */}
                  <div className="flex flex-col justify-center items-center space-y-2 shrink-0">
                    <button
                      onClick={() => setShowChat(prev => !prev)}
                      className={cn(
                        "h-14 w-14 rounded-full border-2 flex flex-col justify-center items-center transition-all duration-350 active:scale-95 cursor-pointer",
                        showChat 
                          ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-500/20" 
                          : "border-cyan-400 bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                      )}
                    >
                      <MessageSquare size={20} className="stroke-[2.5px]" />
                    </button>
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">Chat</span>
                  </div>

                  {/* END CALL */}
                  <div className="flex flex-col justify-center items-center space-y-2 shrink-0">
                    <button
                      onClick={() => handleEndCall(true)}
                      className="h-14 w-14 rounded-full border-2 border-rose-600 bg-rose-600 text-white flex flex-col justify-center items-center shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer"
                    >
                      <PhoneOff size={20} className="stroke-[2.5px]" />
                    </button>
                    <span className="text-[9px] font-black tracking-widest uppercase text-rose-500">End Call</span>
                  </div>
                </CardContent>
              </Card>

            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col relative"
            >
              {/* Top Panel (Floating Header Bar like Zoom) */}
              <div className="absolute top-2 inset-x-2 max-w-[370px] mx-auto bg-white/90 dark:bg-[#161233]/90 backdrop-blur-md border border-slate-150 dark:border-[#221c4e] py-2 px-3.5 rounded-[1.5rem] shadow-xl z-20 flex items-center justify-between gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex-1 text-left min-w-0">
                  <h2 className="text-[10px] font-black text-slate-850 dark:text-white uppercase tracking-wider truncate">
                    {student?.name || "Student User"}
                  </h2>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate mt-0.5">
                    Doubt ID: {sessionId ? sessionId.slice(-6).toUpperCase() : "#VLM-CALL"}
                  </p>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-850 dark:text-white shadow-xs shrink-0">
                  {formatDuration(duration)}
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 relative flex items-center justify-center">
                {/* BIG IMAGE: Student Video Stream */}
                {remoteJoined && !isAudioOnly ? (
                  <div ref={remoteVideoRef} className="absolute inset-0 bg-[#060b18] flex items-center justify-center" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-2xl font-black tracking-wide text-slate-850 dark:text-white uppercase">{student?.name || "Student"}</p>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Student</p>
                  </div>
                )}

                {/* SMALL PREVIEW: Teacher Local Video (Top Right - positioned below header) */}
                {!isAudioOnly && !camOff && (
                  <div className="absolute top-16 right-3 z-30 h-28 w-20 rounded-xl border border-slate-150 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-[#060b18] shadow-lg flex flex-col justify-end">
                    <div ref={localVideoRef} className="absolute inset-0" />
                    <div className="relative z-10 bg-slate-900/80 dark:bg-black/60 py-1 px-1.5 text-[8px] font-black text-white text-center border-t border-slate-800 dark:border-white/5">
                      You
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Panel (Floating Controls Bar like Zoom - 5 options) */}
              <div className="absolute bottom-2 inset-x-2 max-w-[370px] mx-auto bg-white/90 dark:bg-[#161233]/90 backdrop-blur-md border border-slate-150 dark:border-[#221c4e] py-3.5 px-6 rounded-[2rem] shadow-xl z-20">
                <div className="flex items-center justify-between gap-2.5 w-full mx-auto">
                  {/* MIC Toggle */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={toggleMic}
                      className={cn(
                        "h-11 w-11 rounded-2xl flex items-center justify-center border transition-all shadow-xs cursor-pointer",
                        micMuted 
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                      )}
                    >
                      {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    <span className="text-[7.5px] font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      {micMuted ? "Mic Off" : "Mic On"}
                    </span>
                  </div>

                  {/* CAM Toggle */}
                  {!isAudioOnly && (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={toggleCam}
                        className={cn(
                          "h-11 w-11 rounded-2xl flex items-center justify-center border transition-all shadow-xs cursor-pointer",
                          camOff 
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                            : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                        )}
                      >
                        {camOff ? <VideoOff size={16} /> : <Video size={16} />}
                      </button>
                      <span className="text-[7.5px] font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        {camOff ? "Cam Off" : "Cam On"}
                      </span>
                    </div>
                  )}

                  {/* Whiteboard Toggle */}
                  {!isAudioOnly && (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => { setShowWhiteboard(true); sendWhiteboardToggle(sessionId, true); }}
                        className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex items-center justify-center shadow-xs hover:bg-slate-200 dark:hover:bg-slate-850 transition-all cursor-pointer"
                      >
                        <PenLine size={16} />
                      </button>
                      <span className="text-[7.5px] font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase">Board</span>
                    </div>
                  )}

                  {/* CHAT Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setShowChat((prev) => !prev)}
                      className={cn(
                        "h-11 w-11 rounded-2xl flex items-center justify-center border transition-all shadow-xs cursor-pointer",
                        showChat 
                          ? "bg-violet-600 text-white border-violet-500" 
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                      )}
                    >
                      <MessageSquare size={16} />
                    </button>
                    <span className="text-[7.5px] font-black text-slate-500 dark:text-slate-400 tracking-wider uppercase">Chat</span>
                  </div>

                  {/* END SESSION Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleEndCall(true)}
                      className="h-11 w-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 hover:bg-rose-500 active:scale-95 transition-all cursor-pointer border-none"
                    >
                      <PhoneOff size={16} />
                    </button>
                    <span className="text-[7.5px] font-black text-rose-500 dark:text-rose-450 tracking-wider uppercase">End Session</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )
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
              <button
                onClick={() => { setShowWhiteboard(false); sendWhiteboardToggle(sessionId, false); }}
                className="flex items-center gap-1.5 text-sm text-cyan-600 font-bold"
              >
                <ChevronLeft size={18} />
                LIVE SESSION | {subjectName.toUpperCase()}
              </button>
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

              {/* Floating Draggable Student Video Preview (Movable so teacher can explain easily) */}
              <motion.div 
                drag
                dragMomentum={false}
                dragConstraints={{ left: -400, right: 20, top: -20, bottom: 400 }}
                className="absolute top-5 right-5 z-30 bg-white/90 dark:bg-[#161233]/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center w-36 cursor-move select-none"
              >
                <div className="h-32 w-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#060b18] border border-slate-250 dark:border-slate-800 relative">
                  {remoteJoined && !isAudioOnly ? (
                    <div ref={remoteVideoRef} className="absolute inset-0" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                      <Avatar className="h-10 w-10 border border-slate-300">
                        <AvatarImage src={student?.photo} />
                        <AvatarFallback>{student?.name?.[0] || "S"}</AvatarFallback>
                      </Avatar>
                      <span className="text-[9px] font-black text-slate-500 mt-1 uppercase truncate w-full">{student?.name || "Student"}</span>
                    </div>
                  )}
                </div>
                <div className="text-center mt-1.5 w-full">
                  <p className="text-[9px] font-black text-slate-800 dark:text-white uppercase truncate">{student?.name || "Student"}</p>
                  <p className="text-[7.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Student Preview</p>
                </div>
              </motion.div>
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
      {/* Slide-out Live Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-[#161233]/95 backdrop-blur-md border-l border-slate-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Live Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-900 text-white"
              >
                <Minimize2 size={16} />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 font-bold uppercase tracking-wider text-center p-6 space-y-2">
                  <MessageSquare size={24} className="opacity-40" />
                  <p className="text-[10px]">No messages yet</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderRole === "teacher" || msg.senderId === "teacher" || msg.senderName === "You";
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-normal",
                        isMe
                          ? "bg-violet-600 text-white rounded-tr-none ml-auto"
                          : "bg-slate-900 text-white rounded-tl-none mr-auto border border-slate-800"
                      )}
                    >
                      <span className="text-[9px] font-black opacity-60 uppercase mb-0.5">
                        {isMe ? "You" : (currentStudent?.name || "Student")}
                      </span>
                      {msg.mediaUrl ? (
                        <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="block mt-1 max-w-[180px] rounded-lg overflow-hidden border border-slate-800">
                          {msg.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) || msg.type === "media" ? (
                            <img src={msg.mediaUrl} alt="attachment" className="w-full h-auto object-cover max-h-32" />
                          ) : (
                            <div className="p-2 bg-slate-900 text-white flex items-center gap-1">
                              <FileText size={16} />
                              <span className="text-[10px] underline truncate">{msg.mediaUrl.split('/').pop()}</span>
                            </div>
                          )}
                        </a>
                      ) : (
                        <p className="font-medium whitespace-pre-wrap break-words break-all">{msg.content}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-850 flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAttachFile}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 text-white shrink-0 hover:bg-slate-850 mb-0.5"
              >
                <Paperclip size={16} />
              </Button>
              <textarea
                rows={1}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 min-h-[40px] max-h-[80px] py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-violet-550 resize-none overflow-y-auto"
              />
              <Button
                onClick={handleSendChat}
                className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase mb-0.5"
              >
                Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
