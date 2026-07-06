import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { ChevronLeft, PhoneOff, Paperclip, Image as ImageIcon, Mic, Send, Square, Play, Pause, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
import { studentApi } from "@/lib/student-api";
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

const AudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  return (
    <div className="flex items-center gap-3 p-2">
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} />
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
      >
        {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-1" />}
      </button>
      <div className="flex-1">
        <div className="flex gap-1 items-center h-6">
          {/* Fake Waveform Bars */}
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={cn("w-1 rounded-full bg-white/40", isPlaying && "animate-pulse")} 
              style={{ height: `${Math.max(20, Math.random() * 100)}%` }} 
            />
          ))}
        </div>
        <p className="text-[10px] text-white/50 mt-1">Audio doubt explanation</p>
      </div>
    </div>
  );
};

export default function ChatSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, teacher, subjectName = "Doubt Session", requestId } = location.state || {};
  
  const { data: profile } = useStudentProfile();
  const student = (profile as any)?.data ?? profile;
  const studentName = student?.nickname || student?.fullName || "Student";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [stagedAudio, setStagedAudio] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Media Recorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const {
    sendMessage,
    lastMessage,
    typingUserId,
    sendTyping,
    sendStopTyping,
    sendCallEnd,
    callEnded
  } = useSocket({ autoConnect: true, sessionId });

  useEffect(() => {
    setMessages([
      {
        id: "1",
        sender: "teacher",
        text: `Hello ${studentName}! I am connecting to resolve your doubt. How can I help you?`,
        type: "text",
        timestamp: new Date()
      }
    ]);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [studentName]);

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
    <div className={cn("h-[100dvh] w-full flex flex-col bg-[#050914] text-white overflow-hidden relative", bgCss)}>
      
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

      {/* Background Graphic Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] left-[10%] w-[250px] h-[250px] bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-xl lg:max-w-3xl mx-auto flex-1 flex flex-col relative z-10 px-4 h-full">
        
        {/* Header Title & End Button */}
        <div className="pt-6 pb-2 shrink-0 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={handleEndSession}
            className="h-8 w-8 rounded-full border-red-500/50 bg-red-950/30 text-red-400 hover:bg-red-900/50 transition-colors"
          >
            <PhoneOff size={14} />
          </Button>
          <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            Session Duration: {formatTimer(duration)}
          </h2>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Floating Teacher Badge */}
        <div className="mx-auto mt-2 mb-6 max-w-sm w-full bg-white/5 border border-white/10 rounded-full p-1.5 pr-4 flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/30 text-cyan-400 text-xs font-bold tracking-wide">
            {subjectName}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold leading-none">{teacher?.name || "Teacher"}</p>
              <p className="text-[9px] text-white/50 mt-1 uppercase tracking-wider">Doubt ID: {requestId ? requestId.slice(-6).toUpperCase() : "#VLM-C-456"}</p>
            </div>
            <Avatar className="h-8 w-8 ring-2 ring-white/10">
              <AvatarImage src={teacher?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher?.name || "Teacher"}`} />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Messages Container */}
        <main className="flex-1 overflow-y-auto space-y-5 pb-6 pr-1 no-scrollbar flex flex-col">
          {messages.map((msg) => {
            const isMe = msg.sender === "student";
            return (
              <div key={msg.id} className={cn("flex flex-col w-full", isMe ? "items-end" : "items-start")}>
                {!isMe && (
                  <span className="text-[10px] text-cyan-400 font-black tracking-wide mb-1.5 ml-1">
                    Teacher
                  </span>
                )}
                {isMe && (
                  <span className="text-[10px] text-yellow-400 font-black tracking-wide mb-1.5 mr-1">
                    You
                  </span>
                )}
                
                <div
                  className={cn(
                    "rounded-2xl max-w-[85%] border overflow-hidden backdrop-blur-md flex flex-col gap-1",
                    isMe
                      ? "border-yellow-400 bg-yellow-950/20 text-white rounded-tr-sm shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                      : "border-cyan-400 bg-cyan-950/20 text-white rounded-tl-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]",
                    msg.type === "image" ? "p-1.5" : "p-3.5"
                  )}
                >
                  {msg.type === "image" && msg.mediaUrl && (
                    <img 
                      src={msg.mediaUrl} 
                      alt="Attached" 
                      className="rounded-xl w-full h-auto max-h-[300px] object-cover bg-black/20 cursor-pointer" 
                      onClick={() => setExpandedImage(msg.mediaUrl!)}
                    />
                  )}
                  {msg.type === "audio" && msg.mediaUrl && (
                    <AudioPlayer url={msg.mediaUrl} />
                  )}
                  {msg.text && msg.text !== "Image sent" && msg.text !== "File sent" && msg.text !== "Voice note" && (
                    <p className={cn("text-[13px] leading-relaxed font-medium tracking-wide break-words whitespace-pre-wrap break-all", (msg.type === "image" || msg.type === "audio") && "px-1.5 pt-1 pb-0.5")}>
                      {msg.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {typingUserId && typingUserId !== teacher?.userId && (
            <div className="text-[10px] text-cyan-400 italic animate-pulse px-2">
              Teacher is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        <div className="shrink-0 w-full py-4 bg-transparent flex gap-3 relative z-20 items-end">
          <div className="flex-1 bg-[#1a1e2b] border border-white/10 rounded-[24px] flex flex-col p-3 shadow-xl transition-all duration-300 relative">
            
            {/* Staging Area */}
            {(stagedImages.length > 0 || stagedAudio) && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 bg-black/20 rounded-xl border border-white/5">
                {stagedImages.map((img, idx) => (
                  <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => setStagedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-10">
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
                {stagedAudio && audioPreviewUrl && (
                  <div className="flex items-center gap-2 bg-indigo-900/40 p-1 pr-2 rounded-lg border border-indigo-500/30 flex-1 min-w-[150px] relative">
                    <div className="scale-75 origin-left -ml-2 -mr-8">
                      <AudioPlayer url={audioPreviewUrl} />
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
              className="w-full bg-transparent border-0 focus-visible:ring-0 focus:outline-none text-[13px] text-white/90 resize-none h-[60px] overflow-y-auto placeholder:text-white/40 leading-relaxed mb-1"
            />
            <div className="flex items-center gap-4 text-white/40 px-1 mt-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*"
                multiple
              />
              <button onClick={() => fileInputRef.current?.click()} className="hover:text-white transition-colors">
                <Paperclip size={18} />
              </button>
              <button onClick={() => { fileInputRef.current!.accept = "image/*"; fileInputRef.current?.click(); }} className="hover:text-white transition-colors">
                <ImageIcon size={18} />
              </button>
              
              {isRecording ? (
                <button onClick={stopRecording} className="text-red-500 animate-pulse transition-colors relative">
                  <Square size={18} fill="currentColor" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </button>
              ) : (
                <button onClick={startRecording} className="hover:text-white transition-colors">
                  <Mic size={18} />
                </button>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-[#1a1e2b]/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-[24px]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="text-cyan-400 animate-spin" />
                  <span className="text-xs text-cyan-400 font-bold tracking-widest uppercase">Sending...</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={isUploading}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center bg-cyan-400 shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform active:scale-95",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send size={24} className="text-black ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
