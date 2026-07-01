import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  Paperclip, Image as ImageIcon, Mic, Send, Play, Pause, AlertCircle, ChevronLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { useStudentProfile } from "@/hooks/use-student";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender: "student" | "teacher";
  text?: string;
  image?: string;
  audio?: {
    duration: string;
    playing: boolean;
  };
  timestamp: Date;
}

export default function ChatSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useStudentProfile();
  
  const student = (profile as any)?.data ?? profile;
  const studentName = student?.nickname || student?.fullName || "Aisha";
  const { doubtId, subjectName = "Math - Calculus" } = location.state || {};

  // Formatted Doubt ID
  const displayDoubtId = doubtId ? `#VLM-C-${doubtId.slice(-3).toUpperCase()}` : "#VLM-C-456";

  // State for session countdown timer (7 minutes 25 seconds = 445 seconds)
  const [secondsLeft, setSecondsLeft] = useState(445);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with mockup messages
  useEffect(() => {
    setMessages([
      {
        id: "1",
        sender: "student",
        text: "I'm stuck on this second derivative step. Can you help?",
        timestamp: new Date(Date.now() - 120000),
      },
      {
        id: "2",
        sender: "student",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600", // Math equation mockup image
        timestamp: new Date(Date.now() - 110000),
      },
      {
        id: "3",
        sender: "student",
        audio: {
          duration: "0:45",
          playing: false,
        },
        timestamp: new Date(Date.now() - 100000),
      },
      {
        id: "4",
        sender: "teacher",
        text: `Certainly, ${studentName}! Let's break it down.`,
        timestamp: new Date(Date.now() - 60000),
      },
      {
        id: "5",
        sender: "teacher",
        text: "Start with dy/dx = f'(x), then d²y/dx² = [...]. Look at this term.",
        timestamp: new Date(Date.now() - 30000),
      }
    ]);
  }, [studentName]);

  // Countdown timer logic
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "student",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue("");

    // Simulate teacher reply
    setTimeout(() => {
      const teacherMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "teacher",
        text: "Got it! Let's analyze that part together. Try updating the coefficient.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, teacherMsg]);
    }, 1500);
  };

  return (
    <div className={cn("relative h-svh w-full text-white flex flex-col items-center overflow-hidden", bgCss)}>
      
      {/* Background Decor Glows */}
      <div className="absolute top-[15%] left-[-15%] h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[25%] right-[-10%] h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md flex-1 flex flex-col h-full overflow-hidden px-4 pt-4 pb-4 z-10">
        
        {/* ── COUNTDOWN BANNER ── */}
        <div className="text-center mb-3 shrink-0">
          <p className="text-[11px] font-black tracking-[0.2em] text-cyan-400 uppercase animate-pulse">
            SESSION REMAINING: {formatTimer(secondsLeft)}
          </p>
        </div>

        {/* ── TEACHER DETAILS INFO CARD ── */}
        <Card className="border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl p-3 shrink-0 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to doubt button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowExitModal(true)}
                className="h-8 w-8 rounded-full text-white hover:bg-white/10 shrink-0"
              >
                <ChevronLeft size={18} />
              </Button>
              <div className="px-3 py-1 rounded-full border border-cyan-400/40 text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                {subjectName}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full border border-white/10 bg-neutral-900 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha" alt="Teacher" className="h-full w-full object-cover" />
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-white">Aisha Sharma</p>
                <p className="text-[8px] text-white/40 tracking-tight font-bold">{displayDoubtId}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── CHAT MESSAGE LIST (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 no-scrollbar py-2">
          {messages.map((msg) => {
            const isStudent = msg.sender === "student";
            return (
              <div
                key={msg.id}
                className={cn("flex flex-col w-full", isStudent ? "items-start" : "items-end")}
              >
                {/* Sender Name tag */}
                <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1 px-1">
                  {isStudent ? studentName : "Teacher"}
                </span>

                {/* Text Bubble */}
                {msg.text && (
                  <div
                    className={cn(
                      "rounded-2xl p-3 text-xs leading-relaxed max-w-[85%] border",
                      isStudent
                        ? "border-yellow-500/40 bg-yellow-950/10 text-white rounded-tl-none"
                        : "border-cyan-500/40 bg-cyan-950/10 text-white rounded-tr-none"
                    )}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Image Bubble */}
                {msg.image && (
                  <div className="rounded-2xl overflow-hidden max-w-[85%] border border-yellow-500/40 bg-yellow-950/5 p-1 mt-1">
                    <img 
                      src={msg.image} 
                      alt="Doubt attachment" 
                      className="rounded-xl w-full max-h-40 object-cover" 
                    />
                    {/* Math Equation illustration label */}
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      <span className="text-[9px] font-bold text-white/50">f'(x) = 2x + 4</span>
                      <span className="text-[9px] font-bold text-emerald-400">✓ Checked</span>
                    </div>
                  </div>
                )}

                {/* Audio Player Bubble */}
                {msg.audio && (
                  <div className="rounded-2xl p-3 max-w-[85%] w-full border border-yellow-500/40 bg-yellow-950/10 flex items-center gap-3 mt-1">
                    <button 
                      onClick={() => setAudioPlaying(!audioPlaying)}
                      className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shrink-0 cursor-pointer"
                    >
                      {audioPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {/* Waveform graphic illustration */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[4, 8, 5, 9, 3, 6, 2, 7, 4, 8, 3, 5, 8, 4, 7, 5].map((h, i) => (
                          <span 
                            key={i} 
                            style={{ height: `${h * (audioPlaying ? 2.2 : 1.5)}px` }}
                            className={cn(
                              "w-0.5 rounded-full transition-all duration-300", 
                              audioPlaying ? "bg-cyan-400" : "bg-white/30"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-tight mt-0.5">
                        Audio doubt explanation ({msg.audio.duration})
                      </p>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* ── INPUT BAR BLOCK ── */}
        <div className="relative flex items-center gap-2 mt-2 bg-[#161618] border border-white/5 p-2 rounded-2xl shrink-0">
          
          {/* File Attach Icons Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              type="button"
              className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center transition-all cursor-pointer"
            >
              <Paperclip size={15} />
            </button>
            <button 
              type="button"
              className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center transition-all cursor-pointer"
            >
              <ImageIcon size={15} />
            </button>
            <button 
              type="button"
              className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center transition-all cursor-pointer"
            >
              <Mic size={15} />
            </button>
          </div>

          {/* Text Input */}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your explanation..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0 h-9 p-0 text-xs"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="h-9 w-9 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Send size={14} className="rotate-45 -translate-y-0.5 -translate-x-0.5" />
          </button>
        </div>

      </div>

      {/* ── EXIT CONFIRMATION POPUP ── */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-lg p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xs rounded-[2.5rem] border border-red-500/35 bg-white/[0.03] backdrop-blur-3xl p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col items-center gap-6"
            >
              <div className="h-16 w-16 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400 border border-cyan-500/20 text-2xl shadow-inner">
                ⭐
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white leading-snug">
                  Are you sure you want to end this session?
                </h3>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={() => setShowExitModal(false)}
                  className="w-full h-12 rounded-full font-bold text-sm bg-white text-black hover:bg-white/90 border-none transition-all flex items-center justify-center gap-1.5"
                >
                  ✓ CANCEL
                </Button>
                <Button
                  onClick={() => navigate(PATHS.SESSION_FEEDBACK, { state: { doubtId } })}
                  className="w-full h-12 rounded-full font-bold text-sm bg-gradient-to-b from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white border border-red-400/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  ➜ END SESSION
                </Button>
              </div>

              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                We priority match your review
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
