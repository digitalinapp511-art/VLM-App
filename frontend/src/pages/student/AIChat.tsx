import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Send, Mic, Image as ImageIcon, Sparkles, 
  Bot, Lightbulb, Languages, FileBadge, Target, X, RefreshCw, History, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { useStudentProfile } from "@/hooks/use-student";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  image?: string;
  timestamp: Date;
}

const generateSessionId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export default function AIChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: profile } = useStudentProfile();
  
  const student = (profile as any)?.data ?? profile;
  const studentName = student?.nickname || student?.fullName || "Student";
  const aiCredits = student?.wallet?.aiCredits ?? 0;

  const initialQuestion = location.state?.initialQuestion;

  const [sessionId, setSessionId] = useState<string>(generateSessionId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history for the active session
  const fetchSessionHistory = async (id: string) => {
    setIsTyping(false);
    try {
      const res = await studentApi.getAiChatHistory(id);
      if (res?.success && Array.isArray(res.data)) {
        const formatted = res.data.map((msg: any) => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.text,
          image: msg.image,
          timestamp: new Date(msg.createdAt),
        }));
        if (formatted.length > 0) {
          setMessages(formatted);
        } else {
          // Default welcome
          setMessages([
            {
              id: "welcome",
              sender: "ai",
              text: `Hi ${studentName}! I am your VLM AI Tutor. Type any question, math equation, or upload a photo of your textbook problem, and I'll help you solve it step-by-step!`,
              timestamp: new Date(),
            }
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to load AI chat history:", err);
    }
  };

  useEffect(() => {
    fetchSessionHistory(sessionId);
  }, [sessionId, studentName]);

  // Load sessions list when modal opens
  const loadSessionsList = async () => {
    try {
      const res = await studentApi.getAiChatSessions();
      if (res?.success && Array.isArray(res.data)) {
        setSessionsList(res.data);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  useEffect(() => {
    if (showHistoryModal) {
      loadSessionsList();
    }
  }, [showHistoryModal]);

  // Handle initial question if sent from AskDoubt
  useEffect(() => {
    if (initialQuestion && messages.length <= 1) {
      handleSend(initialQuestion);
    }
  }, [initialQuestion]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const deleteSession = async (sid: string) => {
    try {
      const res = await studentApi.deleteAiChatSession(sid);
      if (res?.success) {
        toast.success("Session deleted");
        loadSessionsList();
        if (sid === sessionId) {
          setSessionId(generateSessionId());
        }
      }
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  const clearAllHistory = async () => {
    try {
      const res = await studentApi.clearAllAiChatHistory();
      if (res?.success) {
        toast.success("All chat history cleared");
        setSessionsList([]);
        setShowHistoryModal(false);
        setSessionId(generateSessionId());
      }
    } catch (err) {
      toast.error("Failed to clear history");
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text && !selectedImage) return;

    if (aiCredits <= 0) {
      toast.error("Insufficient AI credits. Please recharge your wallet!");
      return;
    }

    if (!textToSend) {
      setInputValue("");
    }

    const currentImgFile = selectedImage;
    const currentImgPreview = imagePreview;
    removeImage();

    // Add user message
    const userMsgId = Math.random().toString();
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: text || "Image query",
      image: currentImgPreview || undefined,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await studentApi.sendAiChatMessage(text, sessionId, currentImgFile || undefined);
      if (res?.success) {
        const aiMsg: Message = {
          id: res.data.aiMessage._id,
          sender: "ai",
          text: res.data.aiMessage.text,
          timestamp: new Date(),
        };
        // Update user message image URL with actual URL if uploaded
        setMessages(prev => 
          prev.map(m => m.id === userMsgId && res.data.userMessage.image ? { ...m, image: res.data.userMessage.image } : m)
            .concat(aiMsg)
        );
        // Refresh query profile to get updated credits
        queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Failed to get response from AI Tutor";
      toast.error(errMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn("relative h-svh w-full text-white flex flex-col items-center overflow-hidden", bgCss)}>
      
      {/* Background Decor Glows */}
      <div className="absolute top-[10%] left-[-20%] h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Main Container constrained to mobile viewport height */}
      <div className="w-full max-w-md flex-1 flex flex-col h-full overflow-hidden px-4 pt-3 pb-3 z-10">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => {
                if (location.state?.fromAskDoubt) {
                  navigate(PATHS.ASK_DOUBT, { state: { question: initialQuestion } });
                } else {
                  navigate(PATHS.STUDENT_DASHBOARD);
                }
              }}
              className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowHistoryModal(true)}
              className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
              title="Chat History"
            >
              <History size={16} />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-[11px] font-bold tracking-tight text-white/90 leading-tight">AI Tutor</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Chat Button */}
            <Button
              onClick={() => {
                setSessionId(generateSessionId());
                toast.success("New chat session started");
              }}
              className="h-8 px-2 rounded-lg text-[9px] font-bold border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-all cursor-pointer"
            >
              New Chat
            </Button>
            {/* AI Credits Badge */}
            <div className="px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-center">
              <p className="text-[6px] text-white/40 font-bold uppercase tracking-wider">Credits</p>
              <p className="text-[9px] font-black text-cyan-400 tracking-wide">
                {aiCredits} / 2000
              </p>
            </div>
          </div>
        </header>

        {/* ── CHAT MESSAGES AREA (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-0.5 no-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex flex-col w-full", isUser ? "items-end animate-in slide-in-from-right-2 duration-350" : "items-start animate-in slide-in-from-left-2 duration-350")}
                >
                  {/* Sender Tag */}
                  <span className="text-[9px] text-white/30 font-bold tracking-wider mb-1 px-1">
                    {isUser ? studentName : "VLM AI Tutor"}
                  </span>

                  <div className="flex items-start gap-2 max-w-[85%]">
                    {/* Bot Icon on AI side */}
                    {!isUser && (
                      <div className="h-7 w-7 rounded-full border border-cyan-400 bg-cyan-950/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                        <Bot size={14} />
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div
                      className={cn(
                        "rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap flex flex-col gap-2",
                        isUser
                          ? "bg-gradient-to-r from-blue-700/70 to-indigo-900/70 text-white rounded-tr-none border border-blue-500/10 shadow-lg"
                          : "bg-slate-900/80 text-white/95 rounded-tl-none border border-purple-500/20 shadow-md"
                      )}
                    >
                      {msg.image && (
                        <div className="max-w-[200px] rounded-lg overflow-hidden border border-white/10">
                          <img src={msg.image} alt="Doubt Context" className="w-full h-auto object-cover max-h-40" />
                        </div>
                      )}
                      <span>{msg.text}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start"
              >
                <span className="text-[9px] text-white/30 font-bold tracking-wider mb-1">
                  VLM AI Tutor
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full border border-cyan-400 bg-cyan-950/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-900/80 rounded-2xl rounded-tl-none px-3 py-2 border border-purple-500/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>



        {/* ── PROMPTS / ACTION CHIPS ── */}
        <div className="grid grid-cols-4 gap-2 py-1 shrink-0">
          <PromptChip icon={<Target size={14} />} label="Simplify" onClick={() => handleSend("Simplify")} />
          <PromptChip icon={<Lightbulb size={14} />} label="Example" onClick={() => handleSend("Example")} />
          <PromptChip icon={<Languages size={14} />} label="Explain in Hindi" onClick={() => handleSend("Explain in Hindi")} />
          <PromptChip icon={<FileBadge size={14} />} label="Practice" onClick={() => handleSend("Practice Question")} />
        </div>

        {/* Image Preview Block above input bar */}
        {imagePreview && (
          <div className="relative mt-2 p-2 bg-slate-900 border border-white/5 rounded-xl shrink-0 flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/10">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs text-white/50 truncate max-w-[200px]">{selectedImage?.name}</span>
            <button 
              type="button"
              onClick={removeImage}
              className="ml-auto h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* ── INPUT BAR AT BOTTOM ── */}
        <div className="relative flex items-center gap-2 mt-1 bg-[#161618] border border-white/5 p-1.5 rounded-xl shrink-0">
          {/* Image Attach Button */}
          <button 
            type="button"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => handleImageSelect(e as any);
              input.click();
            }}
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <ImageIcon size={16} />
          </button>

          {/* Text Input */}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={aiCredits <= 0 ? "Recharge your wallet to ask questions..." : "Ask another question..."}
            disabled={aiCredits <= 0}
            className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0 h-9 p-0 text-xs disabled:opacity-50"
          />

          {/* Microphone Icon */}
          <button 
            type="button"
            disabled={aiCredits <= 0}
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Mic size={16} />
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={aiCredits <= 0}
            className="h-9 w-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send size={14} />
          </button>
        </div>

      </div>

      {/* ── HISTORY MODAL / DRAWER ── */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-950 p-6 flex flex-col max-h-[80vh] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                  <History size={16} className="text-cyan-400" /> Past Conversations
                </h3>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar max-h-[50vh]">
                {sessionsList.length === 0 ? (
                  <p className="text-center text-xs text-white/30 py-8">No past conversations found.</p>
                ) : (
                  sessionsList.map((sess) => (
                    <div 
                      key={sess._id}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                        sess._id === sessionId 
                          ? "border-cyan-400/30 bg-cyan-950/10" 
                          : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                      )}
                    >
                      <div 
                        onClick={() => {
                          setSessionId(sess._id);
                          setShowHistoryModal(false);
                          toast.success("Loaded conversation");
                        }}
                        className="flex-1 min-w-0 pr-3 text-left"
                      >
                        <p className="text-xs font-bold text-white/90 truncate">
                          {sess.firstMsgText || "Untitled Session"}
                        </p>
                        <p className="text-[9px] text-white/40 mt-1">
                          {new Date(sess.createdAt).toLocaleDateString()} at {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteSession(sess._id)}
                        className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center cursor-pointer transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              {sessionsList.length > 0 && (
                <div className="border-t border-white/5 pt-4 mt-2">
                  <Button
                    onClick={clearAllHistory}
                    variant="ghost"
                    className="w-full h-11 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:text-red-300 hover:border-red-500/40 text-xs font-bold transition-all"
                  >
                    Clear All Chat History
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function PromptChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] active:scale-95 transition-all cursor-pointer min-h-[60px] text-center"
    >
      <div className="text-white/60">{icon}</div>
      <span className="text-[8px] font-bold text-white/40 uppercase tracking-tight leading-tight">
        {label}
      </span>
    </button>
  );
}
