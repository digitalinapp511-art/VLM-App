/**
 * AIChat.tsx — student side
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigned to support:
 * 1. Landing screen showing Chat History list and a "New Chat" button.
 * 2. Tapping "New Chat" or any history item opens the active chat session.
 */
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, History, Bot, ImageIcon, Send, X,
  Trash2, Target, Lightbulb, Languages, FileBadge, Mic, Plus, MessageSquare
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

  // activeSessionId is null by default (showing History/New Chat selector)
  // unless we have an initial question/image coming from the Ask Doubt flow,
  // or a restored session from before a wallet redirect
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const tempSession = sessionStorage.getItem("vlm_temp_active_session_id");
    if (tempSession) {
      sessionStorage.removeItem("vlm_temp_active_session_id");
      return tempSession;
    }
    if (initialQuestion || initialImage) {
      return generateSessionId();
    }
    return null;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSimplify = () => {
    const lastAI = [...messages].reverse().find(m => m.sender === "ai");
    if (lastAI) {
      handleSend(`Simplify your last explanation: "${lastAI.text.slice(0, 150)}..." to make it extremely easy to understand.`);
    } else {
      handleSend("Please simplify the explanation of the topic we are discussing.");
    }
  };

  const handleExample = () => {
    const lastAI = [...messages].reverse().find(m => m.sender === "ai");
    if (lastAI) {
      handleSend(`Give me a practical, real-world example related to: "${lastAI.text.slice(0, 150)}...".`);
    } else {
      handleSend("Can you explain this with a practical example?");
    }
  };

  const handlePractice = () => {
    const lastAI = [...messages].reverse().find(m => m.sender === "ai");
    if (lastAI) {
      handleSend(`Give me a practice question (multiple-choice question) to test my understanding of the concept we just discussed.`);
    } else {
      handleSend("Give me a practice question to test my understanding.");
    }
  };

  const handleTranslate = (langName: string) => {
    setShowTranslateModal(false);
    const lastAI = [...messages].reverse().find(m => m.sender === "ai");
    if (lastAI) {
      handleSend(`Explain your last response in ${langName} language.`);
    } else {
      handleSend(`Explain this topic in ${langName} language.`);
    }
  };

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
          // Default welcome message
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
    if (activeSessionId) {
      fetchSessionHistory(activeSessionId);
    }
  }, [activeSessionId, studentName]);

  // Load sessions list when showing selection/history landing screen
  const loadSessionsList = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await studentApi.getAiChatSessions();
      if (res?.success && Array.isArray(res.data)) {
        setSessionsList(res.data);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!activeSessionId) {
      loadSessionsList();
    }
  }, [activeSessionId]);

  // Handle initial question if sent from AskDoubt
  useEffect(() => {
    if ((initialQuestion || initialImage) && messages.length <= 1 && activeSessionId) {
      handleSend(initialQuestion, initialImage);
    }
  }, [initialQuestion, initialImage, activeSessionId]);

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

  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading the session when deleting
    try {
      const res = await studentApi.deleteAiChatSession(sid);
      if (res?.success) {
        toast.success("Session deleted");
        loadSessionsList();
        if (sid === activeSessionId) {
          setActiveSessionId(null);
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
        setActiveSessionId(null);
      }
    } catch (err) {
      toast.error("Failed to clear history");
    }
  };

  const handleSend = async (textToSend?: string, imageToSend?: File | string | null) => {
    if (!activeSessionId) return;

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
      const res = await studentApi.sendAiChatMessage(text, activeSessionId, currentImgFile || undefined);
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

  const startNewChat = () => {
    const newId = generateSessionId();
    setActiveSessionId(newId);
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: `Hi ${studentName}! I am your VLM AI Tutor. Type any question, math equation, or upload a photo of your textbook problem, and I'll help you solve it step-by-step!`,
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <div className="relative h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center overflow-hidden font-sans transition-colors duration-300">
      
      {/* Main Container constrained to mobile viewport height */}
      <div className="w-full max-w-md flex-1 flex flex-col h-full overflow-hidden px-4 pt-4 pb-3 z-10">
        
        {/* ── LANDING VIEW: HISTORY & NEW CHAT BUTTON ── */}
        {!activeSessionId ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="flex w-full items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
                  className="h-9 w-9 rounded-full border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm"
                >
                  <ChevronLeft size={18} />
                </Button>
                <h1 className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">AI Tutor</h1>
              </div>

              {/* AI Credits Badge */}
              <div 
                onClick={() => {
                  if (activeSessionId) {
                    sessionStorage.setItem("vlm_temp_active_session_id", activeSessionId);
                  }
                  navigate(PATHS.WALLET);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 text-violet-600 dark:text-violet-400 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Recharge Credits"
              >
                <div className="text-left">
                  <p className="text-[6px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider leading-none">AI Credit</p>
                  <p className="text-[10px] font-black text-violet-600 dark:text-violet-400 mt-0.5 leading-none">{aiCredits}</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors">
                  <Plus size={8} className="stroke-[3]" />
                </div>
              </div>
            </header>

            {/* Quick Promo / Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex flex-col gap-1 shadow-md text-left shrink-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1">
                <Bot size={18} />
              </div>
              <h2 className="text-sm font-bold">Ask VLM AI Tutor</h2>
              <p className="text-[10px] text-white/80 leading-normal">
                Instant help for Mathematics, Physics, Chemistry, Biology and more. Snap a picture or ask standard doubts to get step-by-step assistance.
              </p>
            </div>

            {/* Past Conversations / History Section */}
            <div className="flex-1 flex flex-col overflow-hidden mt-4 min-h-0">
              <div className="flex justify-between items-center mb-3 px-1 shrink-0">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                  <History size={13} /> Recent Chats
                </span>
                {sessionsList.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="text-[9px] font-black text-red-500 hover:text-red-600 dark:hover:text-red-400 uppercase tracking-wider cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pb-2 no-scrollbar">
                {isLoadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Loading history...</p>
                  </div>
                ) : sessionsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/5 dark:bg-slate-900/10">
                    <MessageSquare size={20} className="text-slate-300 dark:text-slate-700" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">No recent chats. Start one now!</p>
                  </div>
                ) : (
                  sessionsList.map((sess) => (
                    <motion.div
                      key={sess._id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveSessionId(sess._id)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all cursor-pointer shadow-sm text-left"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                          {sess.firstMsgText || "Untitled Session"}
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-bold">
                          {new Date(sess.createdAt).toLocaleDateString()} at {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <button
                        onClick={(e) => deleteSession(sess._id, e)}
                        className="h-8 w-8 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-105 dark:hover:bg-red-950/40 text-red-500 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                        title="Delete Session"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* New Chat Primary Action at the bottom */}
            <div className="mt-4 pb-2 shrink-0">
              <Button
                onClick={startNewChat}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all"
              >
                <Plus size={16} /> Start New Chat
              </Button>
            </div>
          </div>
        ) : (
          /* ── ACTIVE CHAT SESSION VIEW ── */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="flex w-full items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0 gap-1.5">
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setActiveSessionId(null)} // Returns back to history selection screen!
                  className="h-8 w-8 rounded-full border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm shrink-0"
                  title="Back to Sessions"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex flex-col text-left">
                  <h1 className="text-[11px] font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">AI Tutor</h1>
                  <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Active</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* History Button with Text */}
                <Button
                  variant="ghost"
                  onClick={() => setActiveSessionId(null)}
                  className="h-7 px-2 rounded-lg text-[9px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 gap-1 transition-all shrink-0 cursor-pointer"
                >
                  <History size={11} />
                  <span>History</span>
                </Button>

                {/* New Chat Button */}
                <Button
                  onClick={startNewChat}
                  className="h-7 px-2.5 rounded-lg text-[9px] font-black border border-violet-200 dark:border-violet-900/30 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  New Chat
                </Button>

                {/* AI Credits Badge (Premium Redesign) */}
                <div 
                  onClick={() => {
                    if (activeSessionId) {
                      sessionStorage.setItem("vlm_temp_active_session_id", activeSessionId);
                    }
                    navigate(PATHS.WALLET);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-850 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm cursor-pointer hover:border-violet-300 dark:hover:border-violet-850 transition-all shrink-0 select-none"
                  title="Recharge Credits"
                >
                  <div className="text-left">
                    <p className="text-[6px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider leading-none">AI Credit</p>
                    <p className="text-[9px] font-black text-violet-600 dark:text-violet-400 mt-0.5 leading-none">{aiCredits}</p>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors">
                    <Plus size={8} className="stroke-[3]" />
                  </div>
                </div>
              </div>
            </header>

            {/* Messages Area */}
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
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-wider mb-1 px-1">
                        {isUser ? studentName : "VLM AI Tutor"}
                      </span>

                      <div className="flex items-start gap-2 max-w-[85%]">
                        {!isUser && (
                          <div className="h-7 w-7 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                            <Bot size={14} />
                          </div>
                        )}

                        <div
                          className={cn(
                            "rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap flex flex-col gap-2 shadow-sm text-left",
                            isUser
                              ? "bg-gradient-to-r from-violet-600 to-indigo-700 text-white rounded-tr-none"
                              : "bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-[#221c4e]"
                          )}
                        >
                          {msg.image && (
                            <div className="max-w-[200px] rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
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
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-wider mb-1">
                      VLM AI Tutor
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                        <Bot size={14} />
                      </div>
                      <div className="bg-white dark:bg-[#161233] rounded-2xl rounded-tl-none px-3.5 py-2.5 border border-slate-100 dark:border-[#221c4e] shadow-sm flex items-center gap-1">
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

            {/* Prompts Action Chips */}
            <div className="grid grid-cols-4 gap-2 py-1 shrink-0">
              <PromptChip icon={<Target size={14} />} label="Simplify" onClick={handleSimplify} />
              <PromptChip icon={<Lightbulb size={14} />} label="Example" onClick={handleExample} />
              <PromptChip icon={<Languages size={14} />} label="Translate" onClick={() => setShowTranslateModal(true)} />
              <PromptChip icon={<FileBadge size={14} />} label="Practice" onClick={handlePractice} />
            </div>

            {/* Image Preview Block */}
            {imagePreview && (
              <div className="relative mt-2 p-2 bg-white dark:bg-[#161233] border border-slate-200 dark:border-[#221c4e] rounded-xl shrink-0 flex items-center gap-3 shadow-sm">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-200 truncate max-w-[200px]">Attached Photo</span>
                <button 
                  type="button"
                  onClick={removeImage}
                  className="ml-auto h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="relative flex items-center gap-2 mt-1 bg-white dark:bg-[#161233] border border-slate-200 dark:border-[#221c4e] p-1.5 rounded-2xl shrink-0 shadow-sm">
              <button 
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => handleImageSelect(e as any);
                  input.click();
                }}
                className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <ImageIcon size={16} className="text-violet-600 dark:text-violet-400" />
              </button>

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={aiCredits <= 0 ? "Recharge to ask questions..." : "Ask another question..."}
                disabled={aiCredits <= 0}
                className="flex-1 bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-0 h-9 p-0 text-xs disabled:opacity-50"
              />

              <button 
                type="button"
                disabled={aiCredits <= 0}
                className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Mic size={16} className="text-violet-600 dark:text-violet-400" />
              </button>

              <button
                onClick={() => handleSend()}
                disabled={aiCredits <= 0}
                className="h-9 w-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-violet-500/10 transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── TRANSLATE MODAL ── */}
      <AnimatePresence>
        {showTranslateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTranslateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xs rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] p-5 flex flex-col shadow-2xl text-slate-800 dark:text-slate-100 z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-wider uppercase flex items-center gap-1.5">
                  <Languages size={14} className="text-violet-600 dark:text-violet-400" /> Translate response
                </h3>
                <button 
                  onClick={() => setShowTranslateModal(false)}
                  className="h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Language buttons grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Hindi", local: "Hindi (हिंदी)" },
                  { name: "Gujarati", local: "Gujarati (ગુજરાતી)" },
                  { name: "Marathi", local: "Marathi (मराठी)" },
                  { name: "Bengali", local: "Bengali (বাংলা)" },
                  { name: "Tamil", local: "Tamil (தமிழ்)" },
                  { name: "Telugu", local: "Telugu (తెలుగు)" },
                  { name: "Kannada", local: "Kannada (ಕನ್ನಡ)" },
                  { name: "Punjabi", local: "Punjabi (ਪੰਜਾਬੀ)" }
                ].map((lang) => (
                  <button
                    key={lang.name}
                    onClick={() => handleTranslate(lang.name)}
                    className="py-2.5 px-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-200 dark:hover:border-violet-900/30 text-left text-xs font-black transition-all cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    {lang.local}
                  </button>
                ))}
              </div>
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
      className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl border border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] hover:bg-slate-50 dark:hover:bg-slate-900/20 active:scale-95 transition-all cursor-pointer min-h-[60px] text-center shadow-sm"
    >
      <div className="text-violet-600 dark:text-violet-400">{icon}</div>
      <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">
        {label}
      </span>
    </button>
  );
}
