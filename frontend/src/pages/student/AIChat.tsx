import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Send, Mic, Image as ImageIcon, Sparkles, 
  Bot, Lightbulb, Languages, FileBadge, Target 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { useStudentProfile } from "@/hooks/use-student";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useStudentProfile();
  
  const student = (profile as any)?.data ?? profile;
  const studentName = student?.nickname || student?.fullName || "Student";
  const aiCredits = student?.wallet?.aiCredits ?? 1250;

  const initialQuestion = location.state?.initialQuestion;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with initial question if present, or a welcome prompt
  useEffect(() => {
    if (initialQuestion) {
      setMessages([
        {
          id: "1",
          sender: "user",
          text: initialQuestion,
          timestamp: new Date(),
        },
        {
          id: "2",
          sender: "ai",
          text: `Certainly, ${studentName}! Let's solve this quadratic equation.\n\nFirst, we find the discriminant, D = b² - 4ac.\nFor this equation, a=3, b=-5, c=2.\nD = (-5)² - 4(3)(2) = 25 - 24 = 1.\nSince D > 0, there are two real roots.\n\nNow we use the quadratic formula:\nx = [-b ± √D] / 2a.\nx = [-(-5) ± √1] / 2(3).\nx = [5 ± 1] / 6.\n\nThis gives two roots: x1 = (5+1)/6 = 1 and x2 = (5-1)/6 = 4/6 = 2/3.\n\nSo, the roots are x=1 and x=2/3.`,
          timestamp: new Date(Date.now() + 500),
        }
      ]);
    } else {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Hi ${studentName}! I am your VLM AI Tutor. Type any question, math equation, or upload a photo of your textbook problem, and I'll help you solve it step-by-step!`,
          timestamp: new Date(),
        }
      ]);
    }
  }, [initialQuestion, studentName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue("");
    }

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      let aiText = `That is a great follow-up question! Here is how we think about it: we expand on the concept and analyze the next logical step. (Note: LLM Integration will be added here soon).`;
      
      if (text.toLowerCase() === "simplify") {
        aiText = `Let me explain it in a simpler way: \n\nThink of this problem like breaking a larger task into smaller chunks. We isolate the main variable, solve it first, and then plug it back in to get the final answer!`;
      } else if (text.toLowerCase() === "example") {
        aiText = `Here is a similar example: \n\nSolve: 2x² - 5x + 3 = 0\n\n1. Find discriminant: D = b² - 4ac = (-5)² - 4(2)(3) = 25 - 24 = 1.\n2. Roots: x = (5 ± 1) / 4.\n3. x1 = 1.5, x2 = 1.`;
      } else if (text.toLowerCase() === "explain in hindi") {
        aiText = `ज़रूर! इसे आसान हिंदी में समझते हैं: \n\nइस समीकरण (equation) को हल करने के लिए सबसे पहले हम discriminant (D) निकालते हैं। D का फार्मूला है: D = b² - 4ac. अगर D शून्य से बड़ा है, तो दो वास्तविक उत्तर (roots) मिलेंगे।`;
      } else if (text.toLowerCase() === "practice question") {
        aiText = `Here is a practice question for you to try: \n\nSolve: x² - 5x + 6 = 0 \n\nTry to factorize or use the quadratic formula. Let me know your answer when you're ready!`;
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: aiText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1200);
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
          <div className="flex items-center gap-3">
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
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight text-white/90 leading-tight">AI Tutor - Active Learning</h1>
            </div>
          </div>

          {/* AI Credits Badge */}
          <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-center">
            <p className="text-[7px] text-white/40 font-bold uppercase tracking-wider">AI Credits</p>
            <p className="text-[10px] font-black text-cyan-400 tracking-wide mt-0.5">
              {aiCredits} / 2000
            </p>
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
                        "rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap",
                        isUser
                          ? "bg-gradient-to-r from-blue-700/70 to-indigo-900/70 text-white rounded-tr-none border border-blue-500/10 shadow-lg"
                          : "bg-slate-900/80 text-white/95 rounded-tl-none border border-purple-500/20 shadow-md"
                      )}
                    >
                      {msg.text}
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

        {/* ── INPUT BAR AT BOTTOM ── */}
        <div className="relative flex items-center gap-2 mt-1 bg-[#161618] border border-white/5 p-1.5 rounded-xl shrink-0">
          {/* Image Attach Button */}
          <button 
            type="button"
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <ImageIcon size={16} />
          </button>

          {/* Text Input */}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask another question..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0 h-9 p-0 text-xs"
          />

          {/* Microphone Icon */}
          <button 
            type="button"
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Mic size={16} />
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            className="h-9 w-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Send size={14} />
          </button>
        </div>

      </div>
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
