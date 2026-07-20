import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { ChevronLeft, PhoneOff, Paperclip, Image as ImageIcon, Mic, Send, Square, Play, Pause, X, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
import { studentApi } from "@/lib/student-api";
import { apiClient } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";
import { useStudentProfile } from "@/hooks/use-student";

interface ChatMessage {
  id: string;
  sender: "student" | "teacher";
  text?: string;
  type?: string;
  mediaUrl?: string;
  timestamp: Date;
}

const WAVEFORM_HEIGHTS = [35, 60, 45, 90, 70, 40, 60, 85, 50, 75, 50, 80, 55, 65, 40];

const AudioPlayer = ({ url, theme = "dark" }: { url: string; theme?: "dark" | "light" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    if (audio.duration) {
      setAudioDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const isLight = theme === "light";
  const progress = audioDuration ? (currentTime / audioDuration) : 0;

  const formatAudioTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex items-center gap-3 p-2">
      <audio ref={audioRef} src={url} />
      <button 
        onClick={togglePlay} 
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
          isLight 
            ? "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white" 
            : "bg-white/10 hover:bg-white/20 text-white"
        )}
      >
        {isPlaying ? (
          <Pause size={18} className={isLight ? "text-slate-700 dark:text-white" : "text-white"} />
        ) : (
          <Play size={18} className={cn("ml-1", isLight ? "text-slate-700 dark:text-white" : "text-white")} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex gap-1 items-center h-6 overflow-hidden">
          {/* Waveform Bars colored progressively */}
          {WAVEFORM_HEIGHTS.map((h, i) => {
            const threshold = i / WAVEFORM_HEIGHTS.length;
            const isActive = progress >= threshold;
            return (
              <div 
                key={i} 
                className={cn(
                  "w-1 rounded-full transition-all duration-150", 
                  isLight 
                    ? (isActive ? "bg-violet-600 dark:bg-violet-400" : "bg-slate-200 dark:bg-white/10") 
                    : (isActive ? "bg-white" : "bg-white/30")
                )} 
                style={{ height: `${h}%` }} 
              />
            );
          })}
        </div>
        <p className={cn("text-[10px] mt-1 font-bold", isLight ? "text-slate-400 dark:text-white/50" : "text-white/50")}>
          {audioDuration > 0 
            ? `${formatAudioTime(currentTime)} / ${formatAudioTime(audioDuration)}` 
            : "Audio doubt explanation"}
        </p>
      </div>
    </div>
  );
};

export default function ChatSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, teacher, subjectName = "Doubt Session", requestId, initialQuestion, initialImage } = location.state || {};
  
  const { data: profile } = useStudentProfile();
  const student = (profile as any)?.data ?? profile;
  const studentName = student?.nickname || student?.fullName || "Student";

  const getTeacherDisplayName = (t: any) => {
    if (!t || !t.name) return "Teacher";
    const firstName = t.name.trim().split(/\s+/)[0];
    const gender = (t.gender || "").toLowerCase();
    if (gender === "male") {
      return `${firstName} Sir`;
    }
    return `${firstName} Ma'am`;
  };

  const [currentTeacher, setCurrentTeacher] = useState<any>(teacher);
  const [currentRequestId, setCurrentRequestId] = useState<string>(requestId || "");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [stagedAudio, setStagedAudio] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const [deductions, setDeductions] = useState<{ id: number; text: string }[]>([]);

  // Trigger floating visual deduction badge every 60 seconds
  useEffect(() => {
    if (duration > 0 && duration % 60 === 0 && sessionId && !sessionId.startsWith("mock-")) {
      const id = Date.now();
      const studentClassStr = student?.class || '10';
      const classNum = parseInt(studentClassStr.replace(/\D/g, ''), 10) || 10;
      let deductAmount = 4;
      if (classNum >= 1 && classNum <= 8) {
        deductAmount = 3;
      } else if (classNum >= 9 && classNum <= 10) {
        deductAmount = 4;
      } else if (classNum >= 11 && classNum <= 12) {
        deductAmount = 5;
      }

      setDeductions((prev) => [...prev, { id, text: `-${deductAmount}` }]);
      // Call backend API to actually deduct credits from student wallet
      studentApi.deductSessionCredits(sessionId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
        })
        .catch((err) => console.error("Error deducting credits:", err));

      setTimeout(() => {
        setDeductions((prev) => prev.filter((d) => d.id !== id));
      }, 2000);
    }
  }, [duration, sessionId, queryClient, student]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSentInitialDoubt = useRef(false);
  
  // Media Recorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Fetch session details on mount to sync timer and ensure we have correct doubt ID
  useEffect(() => {
    if (!sessionId) return;
    apiClient.get(`/sessions/${sessionId}`)
      .then(res => {
        if (res.data?.success && res.data.data) {
          const s = res.data.data;
          if (s.teacherId) {
            setCurrentTeacher({
              name: s.teacherId.fullName,
              photo: s.teacherId.profilePhoto,
              gender: s.teacherId.gender
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

  const {
    sendMessage,
    lastMessage,
    typingUserId,
    sendTyping,
    sendStopTyping,
    sendCallEnd,
    callEnded,
    isConnected
  } = useSocket({ autoConnect: true, sessionId });

  useEffect(() => {
    if (!sessionId) return;
    
    // Load historical messages
    apiClient.get(`/sessions/${sessionId}/messages`)
      .then(res => {
        if (res.data?.success && res.data.data) {
          const mapped = res.data.data.map((m: any) => ({
            id: m._id,
            sender: m.senderRole,
            text: m.content,
            type: m.type,
            mediaUrl: m.mediaUrl,
            timestamp: new Date(m.createdAt)
          }));
          if (mapped.length > 0) {
            setMessages(mapped);
          } else {
            setMessages([
              {
                id: "1",
                sender: "teacher",
                text: `Hello ${studentName}! I am connecting to resolve your doubt. How can I help you?`,
                type: "text",
                timestamp: new Date()
              }
            ]);
          }
        }
      })
      .catch(err => console.error("Error loading chat history:", err));

    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, studentName]);

  // Automatically send initial doubt question and image when socket is connected
  useEffect(() => {
    if (isConnected && sessionId && !hasSentInitialDoubt.current) {
      if (initialImage || initialQuestion) {
        hasSentInitialDoubt.current = true;
        // Wait briefly for the room join acknowledgement
        setTimeout(() => {
          if (initialImage) {
            sendMessage({
              sessionId,
              content: initialQuestion || "",
              type: "image",
              mediaUrl: initialImage
            });
          } else if (initialQuestion) {
            sendMessage({
              sessionId,
              content: initialQuestion,
              type: "text"
            });
          }
        }, 500);
      }
    }
  }, [isConnected, sessionId, initialQuestion, initialImage]);

  useEffect(() => {
    if (!lastMessage) return;
    const isMe = lastMessage.senderRole === "student";
    const newMsg: ChatMessage = {
      id: lastMessage.id || Math.random().toString(),
      sender: isMe ? "student" : "teacher",
      text: lastMessage.content,
      type: lastMessage.type || "text",
      mediaUrl: lastMessage.mediaUrl,
      timestamp: new Date(lastMessage.timestamp),
    };
    setMessages((prev) => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
  }, [lastMessage]);

  useEffect(() => {
    if (callEnded) {
      toast.info("Session has been completed by the teacher.");
      handleEndSession();
    }
  }, [callEnded]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text && stagedImages.length === 0 && !stagedAudio) return;

    setIsUploading(true);
    let firstMessageSent = false;

    // Send audio if any
    if (stagedAudio) {
      const url = await uploadMedia(stagedAudio);
      if (url) {
        sendMessage({
          sessionId,
          content: !firstMessageSent && text ? text : "",
          type: "audio",
          mediaUrl: url
        });
        firstMessageSent = true;
      }
    }

    // Send images if any
    for (const image of stagedImages) {
      const url = await uploadMedia(image);
      if (url) {
        sendMessage({
          sessionId,
          content: !firstMessageSent && text ? text : "",
          type: "image",
          mediaUrl: url
        });
        firstMessageSent = true;
      }
    }

    // Send text if nothing else was sent
    if (!firstMessageSent && text) {
      sendMessage({
        sessionId,
        content: text,
        type: "text"
      });
    }

    setInputValue("");
    setStagedImages([]);
    setStagedAudio(null);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setIsUploading(false);
    sendStopTyping(sessionId);
  };

  const uploadMedia = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("media", file);
      const res = await studentApi.uploadChatMedia(formData);
      return res.url;
    } catch (err) {
      toast.error("Failed to upload media");
      return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      setStagedImages(prev => [...prev, ...imageFiles]);
    } else {
      toast.error("Only images can be staged right now.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
        setStagedAudio(file);
        setAudioPreviewUrl(URL.createObjectURL(file));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleEndSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sendCallEnd(sessionId);
    toast.success("Session ended.");
    navigate(PATHS.SESSION_FEEDBACK, { state: { sessionId, subjectName } });
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex h-[100dvh] w-full flex-col bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 backdrop-blur-xl"
            onClick={() => setExpandedImage(null)}
          >
            <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50">
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={expandedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl lg:max-w-3xl mx-auto flex-1 flex flex-col relative z-10 px-4 overflow-hidden">
        
        {/* Header Title & End Button */}
        <div className="pt-6 pb-2 shrink-0 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleEndSession}
            className="h-9 w-9 rounded-xl border-rose-200 dark:border-rose-950/20 bg-rose-50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm shrink-0"
          >
            <PhoneOff size={16} />
          </Button>
          <h2 className="text-[10px] md:text-xs font-black text-rose-500 uppercase tracking-widest text-center flex-1 truncate px-1">
            Duration: {formatTimer(duration)}
          </h2>
          <div className="relative">
            <AnimatePresence>
              {deductions.map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -25, scale: 1 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6 }}
                  className="absolute left-1/2 -translate-x-1/2 text-rose-500 font-black text-sm z-50 pointer-events-none drop-shadow-[0_2px_4px_rgba(244,63,94,0.3)]"
                >
                  {d.text}
                </motion.div>
              ))}
            </AnimatePresence>
            <div 
              onClick={() => navigate(PATHS.WALLET)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 text-violet-600 dark:text-violet-400 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-[10px] font-black uppercase tracking-wider">Doubt Credit:</span>
              <span className="text-xs font-black">{student?.wallet?.humanChatCredits ?? 0}</span>
              <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors">
                <Plus size={10} className="stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Teacher Badge */}
        <div className="mx-auto mt-2 mb-4 max-w-sm w-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-full p-1.5 pr-4 flex items-center justify-between shadow-sm">
          <div className="px-4 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-900 bg-cyan-50/30 dark:bg-cyan-950/20 text-cyan-500 text-[10px] font-black tracking-wider uppercase">
            {subjectName}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black leading-none text-slate-800 dark:text-white">{currentTeacher?.name || "Teacher"}</p>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-bold">Doubt ID: {currentRequestId ? currentRequestId.slice(-6).toUpperCase() : "#VLM-C-456"}</p>
            </div>
            <Avatar className="h-8 w-8 ring-2 ring-slate-100 dark:ring-slate-800 shrink-0">
              <AvatarImage src={currentTeacher?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTeacher?.name || "Teacher"}`} />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Messages Container */}
        <main className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 no-scrollbar flex flex-col">
          {messages.map((msg) => {
            const isMe = msg.sender === "student";
            return (
              <div key={msg.id} className={cn("flex flex-col w-full", isMe ? "items-end" : "items-start")}>
                {!isMe && (
                  <span className="text-[9px] text-cyan-500 font-black tracking-wide mb-1 ml-1 uppercase">
                    {getTeacherDisplayName(currentTeacher)}
                  </span>
                )}

                {isMe && (
                  <span className="text-[9px] text-violet-500 dark:text-violet-400 font-black tracking-wide mb-1 mr-1 uppercase">
                    You
                  </span>
                )}
                
                <div
                  className={cn(
                    "rounded-2xl max-w-[85%] overflow-hidden flex flex-col gap-1 shadow-xs border",
                    isMe
                      ? "bg-violet-600 text-white rounded-tr-sm border-none"
                      : "bg-white dark:bg-[#161233] text-slate-800 dark:text-white border-slate-100 dark:border-[#221c4e] rounded-tl-sm",
                    msg.type === "image" ? "p-1.5" : "p-3.5"
                  )}
                >
                  {msg.type === "image" && msg.mediaUrl && (
                    <img 
                      src={msg.mediaUrl} 
                      alt="Attached" 
                      className="rounded-xl w-full h-auto max-h-[300px] object-cover bg-slate-100 dark:bg-slate-900 cursor-pointer" 
                      onClick={() => setExpandedImage(msg.mediaUrl!)}
                    />
                  )}
                  {msg.type === "audio" && msg.mediaUrl && (
                    <AudioPlayer url={msg.mediaUrl} theme={isMe ? "dark" : "light"} />
                  )}
                  {msg.text && msg.text !== "Image sent" && msg.text !== "File sent" && msg.text !== "Voice note" && msg.text !== "Voice message" && (
                    <p className={cn("text-[13px] leading-relaxed font-bold tracking-wide break-words whitespace-pre-wrap break-all", (msg.type === "image" || msg.type === "audio") && "px-1.5 pt-1 pb-0.5")}>
                      {msg.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {typingUserId && typingUserId !== currentTeacher?.userId && (
            <div className="text-[10px] text-cyan-500 font-black italic animate-pulse px-2">
              Teacher is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </main>
        <div className="shrink-0 w-full pb-6 pt-2 bg-transparent flex gap-3 relative z-20 items-end">
          <div className="flex-1 bg-white dark:bg-[#161233] border border-slate-200 dark:border-[#221c4e] rounded-[24px] flex flex-col p-3 shadow-sm transition-all duration-300 relative">
            
            {/* Staging Area */}
            {(stagedImages.length > 0 || stagedAudio) && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                {stagedImages.map((img, idx) => (
                  <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                    <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => setStagedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-10">
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
                {stagedAudio && audioPreviewUrl && (
                  <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/20 p-2 rounded-lg border border-violet-100 dark:border-violet-900/40 flex-1 min-w-0 w-full relative">
                    <div className="flex-1 min-w-0">
                      <AudioPlayer url={audioPreviewUrl} theme="light" />
                    </div>
                    <button onClick={() => {
                      setStagedAudio(null);
                      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
                      setAudioPreviewUrl(null);
                    }} className="absolute top-2 right-2 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-10">
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                sendTyping(sessionId);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="w-full bg-transparent border-0 focus-visible:ring-0 focus:outline-none text-[13px] text-slate-800 dark:text-white/95 resize-none h-[60px] overflow-y-auto placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed mb-1"
            />
            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 px-1 mt-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*"
                multiple
              />
              <button onClick={() => fileInputRef.current?.click()} className="hover:text-slate-600 dark:hover:text-white transition-colors">
                <Paperclip size={18} />
              </button>
              <button onClick={() => { fileInputRef.current!.accept = "image/*"; fileInputRef.current?.click(); }} className="hover:text-slate-600 dark:hover:text-white transition-colors">
                <ImageIcon size={18} />
              </button>
              
              {isRecording ? (
                <button onClick={stopRecording} className="text-rose-500 animate-pulse transition-colors relative">
                  <Square size={18} fill="currentColor" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                </button>
              ) : (
                <button onClick={startRecording} className="hover:text-slate-600 dark:hover:text-white transition-colors">
                  <Mic size={18} />
                </button>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-[#161233]/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-[24px]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="text-violet-500 animate-spin" />
                  <span className="text-xs text-violet-500 font-black tracking-widest uppercase">Sending...</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={isUploading}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center bg-violet-600 text-white shrink-0 shadow-md shadow-violet-500/20 transition-transform active:scale-95 cursor-pointer",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send size={22} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
