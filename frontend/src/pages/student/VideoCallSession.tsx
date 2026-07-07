/**
 * VideoCallSession.tsx  — student side
 * Agora RTC video/audio call + HTML5 Collaborative Whiteboard
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, PenLine, Eraser, Trash2,
  Minimize2, ChevronLeft, Undo, Redo, Pencil, FileText, PenTool,
  ShieldCheck, MessageSquare, Paperclip
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
import { Button } from "@/components/ui/button";
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
    remoteDrawAction, remoteClearCanvas, remoteWhiteboardToggle, sendWhiteboardDraw, sendWhiteboardClear, sendCallEnd,
    callEnded, sendMessage, lastMessage
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
      const res = await studentApi.uploadChatMedia(formData);
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
    if (!isAudioOnly && remoteJoined && remoteVideoRef.current && agoraClient) {
      const remoteUsers = agoraClient.remoteUsers;
      for (const user of remoteUsers) {
        if (user.videoTrack) {
          user.videoTrack.play(remoteVideoRef.current);
        }
      }
    }
  }, [remoteJoined, joined, showWhiteboard, remoteVideoRef.current]);

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
    <div className="relative flex min-h-svh w-full flex-col bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden font-sans">
      
      <div className="flex-1 flex flex-col relative">
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
              {subjectName || "Doubt Session"}
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
        <div className="flex-1 relative flex items-center justify-center bg-slate-950">
          {showWhiteboard ? (
            <div className="absolute inset-0 bg-white">
              {/* STUDENT CANVAS: read-only, no mouse/touch drawing handlers */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 block bg-white"
              />
            </div>
          ) : (
            <>
              {/* BIG IMAGE: Teacher Video Stream */}
              {remoteJoined && !isAudioOnly ? (
                <div ref={remoteVideoRef} className="absolute inset-0 bg-[#060b18] flex items-center justify-center" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <p className="text-2xl font-black tracking-wide text-slate-850 dark:text-white uppercase">{teacher?.name || "Teacher Name"}</p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Faculty</p>
                </div>
              )}

              {/* SMALL PREVIEW: Student Local Video (Top Right - positioned below header) */}
              {!isAudioOnly && !camOff && (
                <div className="absolute top-16 right-3 z-30 h-28 w-20 rounded-xl border border-slate-150 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-[#060b18] shadow-lg flex flex-col justify-end">
                  <div ref={localVideoRef} className="absolute inset-0" />
                  <div className="relative z-10 bg-slate-900/80 dark:bg-black/60 py-1 px-1.5 text-[8px] font-black text-white text-center border-t border-slate-800 dark:border-white/5">
                    You
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Panel (Floating Controls Bar like Zoom) */}
        <div className="absolute bottom-2 inset-x-2 max-w-[370px] mx-auto bg-white/90 dark:bg-[#161233]/90 backdrop-blur-md border border-slate-150 dark:border-[#221c4e] py-3.5 px-6 rounded-[2rem] shadow-xl z-20">
          <div className="flex items-center justify-between gap-4 w-full mx-auto">
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
              <span className="text-[7.5px] font-black text-rose-500 dark:text-rose-450 tracking-wider uppercase">End Call</span>
            </div>
          </div>
        </div>

        {/* Slide-out Live Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-[#161233]/95 backdrop-blur-md border-l border-slate-150 dark:border-[#221c4e] z-30 flex flex-col shadow-2xl"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Live Chat</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(false)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
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
                    const isMe = msg.senderRole === "student" || msg.senderId === "student" || msg.senderName === "You";
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-normal",
                          isMe
                            ? "bg-violet-600 text-white rounded-tr-none ml-auto"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-850 dark:text-white rounded-tl-none mr-auto"
                        )}
                      >
                        <span className="text-[9px] font-black opacity-60 uppercase mb-0.5">
                          {isMe ? "You" : (teacher?.name || "Teacher")}
                        </span>
                        {msg.mediaUrl ? (
                          <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="block mt-1 max-w-[180px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                            {msg.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) || msg.type === "media" ? (
                              <img src={msg.mediaUrl} alt="attachment" className="w-full h-auto object-cover max-h-32" />
                            ) : (
                              <div className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-850 dark:text-white flex items-center gap-1">
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
              <div className="p-3 border-t border-slate-150 dark:border-slate-850 flex items-end gap-2">
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
                  className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white shrink-0 hover:bg-slate-100 dark:hover:bg-slate-850 mb-0.5"
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
                  className="flex-1 min-h-[40px] max-h-[80px] py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none overflow-y-auto"
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
    </div>
  );
}
