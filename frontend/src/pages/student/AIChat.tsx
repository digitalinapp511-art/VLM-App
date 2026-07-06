/**
 * AIChat.tsx — student side
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigned to match the light, gamified VLM Academy dashboard theme.
 */
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, History, Bot, ImageIcon, Send, X,
  Trash2, Target, Lightbulb, Languages, FileBadge, Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn & UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { studentApi } from "@/lib/student-api";
import { useStudentProfile } from "@/hooks/use-student";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  image?: string;
  timestamp: Date;
}

const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function AIChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: profile } = useStudentProfile();
  
  const student = (profile as any)?.data ?? profile;
  const studentName = student?.nickname || student?.fullName || "Student";
  const aiCredits = student?.wallet?.aiCredits ?? 0;

  const initialQuestion = location.state?.initialQuestion;
  const initialImage = location.state?.initialImage;

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
    if ((initialQuestion || initialImage) && messages.length <= 1) {
      handleSend(initialQuestion, initialImage);
    }
  }, [initialQuestion, initialImage]);

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
      if (!imagePreview.startsWith("http")) {
        URL.revokeObjectURL(imagePreview);
      }
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

  const handleSend = async (textToSend?: string, imageToSend?: File | string | null) => {
    const text = (textToSend ?? inputValue).trim();
    const currentImgFile = imageToSend !== undefined ? imageToSend : selectedImage;
    if (!text && !currentImgFile) return;

    if (aiCredits <= 0) {
      toast.error("Insufficient AI credits. Please recharge your wallet!");
      return;
    }

    if (!textToSend) {
      setInputValue("");
    }

    const currentImgPreview = (typeof currentImgFile === "string")
      ? currentImgFile
      : (currentImgFile ? URL.createObjectURL(currentImgFile) : null);

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
    <div className="relative h-svh w-full bg-[#f4f6ff] text-slate-800 flex flex-col items-center overflow-hidden font-sans">
      
      {/* Main Container constrained to mobile viewport height */}
      <div className="w-full max-w-md flex-1 flex flex-col h-full overflow-hidden px-4 pt-4 pb-3 z-10">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between pb-3 border-b border-slate-100 shrink-0">
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
              className="h-9 w-9 rounded-full border-slate-100 bg-white text-slate-600 shadow-sm"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowHistoryModal(true)}
              className="h-9 w-9 rounded-full border-slate-100 bg-white text-slate-600 shadow-sm"
              title="Chat History"
            >
              <History size={16} />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xs font-black tracking-tight text-slate-800 leading-tight">AI Tutor</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Chat Button */}
            <Button
              onClick={() => {
                setSessionId(generateSessionId());
                setMessages([
                  {
                    id: "welcome",
                    sender: "ai",
                    text: `Hi ${studentName}! I am your VLM AI Tutor. Type any question, math equation, or upload a photo of your textbook problem, and I'll help you solve it step-by-step!`,
                    timestamp: new Date(),
                  }
                ]);
                toast.success("New chat session started");
              }}
              className="h-8 px-3 rounded-xl text-[10px] font-black border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all cursor-pointer shadow-sm"
            >
              New Chat
            </Button>
            {/* AI Credits Badge */}
            <div className="px-3 py-1 rounded-xl border border-slate-200 bg-white shadow-sm text-center">
              <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Credits</p>
              <p className="text-[10px] font-black text-violet-600 tracking-wide">
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
                  className={cn("flex flex-col w-full", isUser ? "items-end" : "items-start")}
                >
                  {/* Sender Tag */}
                  <span className="text-[9px] text-slate-400 font-black tracking-wider mb-1 px-1">
                    {isUser ? studentName : "VLM AI Tutor"}
                  </span>

                  <div className="flex items-start gap-2 max-w-[85%]">
                    {/* Bot Icon on AI side */}
                    {!isUser && (
                      <div className="h-7 w-7 rounded-full border border-violet-200 bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Bot size={14} />
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div
                      className={cn(
                        "rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap flex flex-col gap-2 shadow-sm",
                        isUser
                          ? "bg-gradient-to-r from-violet-600 to-indigo-700 text-white rounded-tr-none"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                      )}
                    >
                      {msg.image && (
                        <div className="max-w-[200px] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
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
                <span className="text-[9px] text-slate-400 font-black tracking-wider mb-1">
                  VLM AI Tutor
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full border border-violet-200 bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-2.5 border border-slate-100 shadow-sm flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* ── PROMPTS / ACTION CHIPS ── */}
        <div className="grid grid-cols-4 gap-2 py-1 shrink-0">
          <PromptChip icon={<Target size={14} />} label="Simplify" onClick={() => handleSend("Simplify this")} />
          <PromptChip icon={<Lightbulb size={14} />} label="Example" onClick={() => handleSend("Give me an example")} />
          <PromptChip icon={<Languages size={14} />} label="Explain Hindi" onClick={() => handleSend("Explain this in Hindi")} />
          <PromptChip icon={<FileBadge size={14} />} label="Practice" onClick={() => handleSend("Give me a practice question")} />
        </div>

        {/* Image Preview Block above input bar */}
        {imagePreview && (
          <div className="relative mt-2 p-2 bg-white border border-slate-200 rounded-xl shrink-0 flex items-center gap-3 shadow-sm">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs text-slate-700 truncate max-w-[200px]">Attached Photo</span>
            <button 
              type="button"
              onClick={removeImage}
              className="ml-auto h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* ── INPUT BAR AT BOTTOM ── */}
        <div className="relative flex items-center gap-2 mt-1 bg-white border border-slate-200 p-1.5 rounded-2xl shrink-0 shadow-sm">
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
            className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <ImageIcon size={16} className="text-violet-600" />
          </button>

          {/* Text Input */}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={aiCredits <= 0 ? "Recharge to ask questions..." : "Ask another question..."}
            disabled={aiCredits <= 0}
            className="flex-1 bg-transparent border-none text-slate-800 placeholder:text-slate-300 focus-visible:ring-0 h-9 p-0 text-xs disabled:opacity-50"
          />

          {/* Microphone Icon */}
          <button 
            type="button"
            disabled={aiCredits <= 0}
            className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Mic size={16} className="text-violet-600" />
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={aiCredits <= 0}
            className="h-9 w-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-violet-500/10 transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm rounded-[24px] border border-slate-100 bg-white p-6 flex flex-col max-h-[80vh] shadow-2xl text-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
                  <History size={16} className="text-violet-600" /> Past Conversations
                </h3>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar max-h-[50vh]">
                {sessionsList.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8 font-medium">No past conversations found.</p>
                ) : (
                  sessionsList.map((sess) => (
                    <div 
                      key={sess._id}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm",
                        sess._id === sessionId 
                          ? "border-violet-200 bg-violet-50/40" 
                          : "border-slate-100 bg-white hover:bg-slate-50"
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
                        <p className="text-xs font-black text-slate-800 truncate">
                          {sess.firstMsgText || "Untitled Session"}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1 font-bold">
                          {new Date(sess.createdAt).toLocaleDateString()} at {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteSession(sess._id)}
                        className="h-8 w-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
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
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <Button
                    onClick={clearAllHistory}
                    className="w-full h-11 rounded-2xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-black transition-all shadow-sm"
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
      className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all cursor-pointer min-h-[60px] text-center shadow-sm"
    >
      <div className="text-violet-600">{icon}</div>
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-wide leading-tight">
        {label}
      </span>
    </button>
  );
}
