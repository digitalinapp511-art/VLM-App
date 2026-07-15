import {studentApi} from "@/lib/student-api";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStudentProfile } from "@/hooks/use-student";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Clock,  ArrowRight, 
  ChevronRight, BookOpen, Calendar, BookText, XCircle, Flame, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bgCss } from "@/helper/CssHelper";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type McqOption = {
  id: string;
  text: string;
};

type McqQuestion = {
  id: string;
  question: string;
  options: McqOption[];
  correctAnswer: string;
  _dbAnswer: unknown;
};

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function Mcq() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [selectedHistoryTask, setSelectedHistoryTask] = useState<any>(null);

  // Timer Effect
  useEffect(() => {
    if (!quizStarted || isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch MCQ task data (includes streak, calendar completedDays, leaderboard)
  const { data: mcqData, isLoading, refetch } = useQuery({
    queryKey: ["dailyMcqData"],
    queryFn: () => studentApi.getDailyMcq(),
  });

  // Fetch MCQ history
  const { data: historyData } = useQuery({
    queryKey: ["mcqHistory"],
    queryFn: () => studentApi.getMcqHistory(),
  });

  const historyList = historyData?.data || [];

  const student = (profile as any)?.data ?? profile;
  const task = mcqData?.data || mcqData?.task;
  const questionsList = task?.questions || [];

  const questions = questionsList.map((q: any, index: number) => ({
    id: q._id || String(index),
    question: q.question,
    options: (q.options as string[]).map((opt: string, i: number) => ({
      id: String.fromCharCode(65 + i),
      text: opt,
    })),
    correctAnswer: String.fromCharCode(65 + (typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.options as string[]).indexOf(q.answer || q.correctAnswer))),
    _dbAnswer: q.answer || q.correctAnswer,
  }));

  // Load answers if quiz is already completed
  useEffect(() => {
    if (task && task.status === 'completed' && task.answers) {
      const loadedAnswers: Record<number, string> = {};
      task.answers.forEach((ans: any) => {
        const optionLetter = String.fromCharCode(65 + ans.selectedAnswer);
        loadedAnswers[ans.questionIndex] = optionLetter;
      });
      setUserAnswers(loadedAnswers);
    }
  }, [task]);

  const streak = mcqData?.streak ?? student?.streak ?? 0;
  const completedDays = mcqData?.completedDays || [];
  const leaderboard = mcqData?.leaderboard || [];
  const isAlreadyDone = task?.status === 'completed';

  const totalQuestions = questions.length;
  const progressValue = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  const handleSelect = (optionId: string) => {
    setUserAnswers({ ...userAnswers, [currentIndex]: optionId });
  };

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz Finished! Submit all answers to API in one go
      const answersList = questions.map((q: any, idx: number) => {
        const selectedLetter = userAnswers[idx];
        const selectedIndex = selectedLetter ? selectedLetter.charCodeAt(0) - 65 : 0;
        return {
          questionIndex: idx,
          selectedAnswer: selectedIndex
        };
      });

      try {
        if (task?._id) {
          await studentApi.submitMcq(task._id, answersList);
        }
      } catch (err) {
        console.error("Failed to submit MCQ:", err);
      }
      setIsFinished(true);
      refetch(); // Reload daily MCQ data to update leaderboard/streak/calendar status!
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q: any, index: number) => {
      if (userAnswers[index] === q.correctAnswer) score++;
    });
    return score;
  };

  // ── 1. PRE-QUIZ DASHBOARD (STREAK + LEADERBOARD MODAL + CTA) ──
  if (!quizStarted && !isFinished) {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayDayIndex = new Date().getDay();

    return (
      <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-xl w-full flex flex-col min-h-svh pb-24">
          
          {/* Header */}
          <div className="relative z-10 flex w-full items-center justify-between mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
              className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </Button>
            <h1 className="text-md font-black tracking-tight uppercase">Daily MCQ Challenge</h1>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowLeaderboardModal(true)}
              className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
              title="Class Leaderboard"
            >
              <Trophy size={18} className="text-yellow-500" />
            </Button>
          </div>

          <main className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* STREAK VIEW CARD */}
            <div className="relative w-full rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 flex flex-col items-center shadow-sm text-center">
              <div className="relative flex items-center justify-center mb-3">
                <div className="absolute inset-0 h-16 w-16 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
                <Flame size={44} className="text-orange-500 fill-orange-500 relative z-10 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
              </div>

              <h2 className="text-base font-black text-slate-800 dark:text-white">MCQ Streak</h2>
              <div className="text-4xl font-black tracking-tight text-cyan-500 my-1 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                {streak}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Current Streak Days</p>

              {/* Streak Calendar Box */}
              <div className="mt-5 w-full rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 flex flex-col items-center">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Streak Calendar</p>
                <div className="grid grid-cols-7 gap-2 w-full">
                  {daysOfWeek.map((day, idx) => {
                    const isCompleted = completedDays.includes(idx);
                    const isToday = idx === todayDayIndex;
                    const isPast = idx < todayDayIndex;
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5">
                        <span className={cn("text-[9px] font-black", isToday ? "text-cyan-500" : "text-slate-400 dark:text-slate-550")}>{day}</span>
                        <div 
                          className={cn(
                            "h-7 w-7 rounded-full border flex items-center justify-center transition-all text-xs font-black",
                            isCompleted
                              ? isToday
                                ? "bg-cyan-500 border-cyan-500 text-white shadow-sm"
                                : "border-cyan-200 dark:border-cyan-900 bg-cyan-50/30 dark:bg-cyan-950/20 text-cyan-500"
                              : isPast
                                ? "border-rose-200 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/10 text-rose-500"
                                : isToday
                                  ? "border-cyan-500 bg-transparent text-slate-300 dark:text-slate-700 animate-pulse"
                                  : "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-transparent"
                          )}
                        >
                          {isCompleted || (isToday && isAlreadyDone) ? (
                            <svg className="h-3 w-3 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : isPast ? (
                            <svg className="h-2.5 w-2.5 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <Button
              onClick={() => {
                if (questions.length > 0) {
                  setQuizStarted(true);
                } else {
                  toast.error("Quiz questions are not loaded yet. Try again in a moment.");
                }
              }}
              disabled={isAlreadyDone}
              className={cn(
                "w-full h-14 rounded-2xl text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer border-none",
                isAlreadyDone
                  ? "bg-green-500/10 border border-green-500/20 text-green-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white shadow-violet-500/20"
              )}
            >
              {isAlreadyDone ? "Challenge Completed" : "Start Daily MCQ"}
            </Button>

            {/* PRACTICE HISTORY SECTION */}
            <div className="w-full text-left space-y-3 pt-4">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider pl-1">
                Practice History
              </h3>
              {historyList.length === 0 ? (
                <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] p-5 text-center">
                  <p className="text-xs font-bold text-slate-400">No previous practice data available.</p>
                </Card>
              ) : (
                <div className="space-y-2.5 max-h-[40vh] overflow-y-auto no-scrollbar">
                  {historyList.map((histTask: any) => {
                    const dateStr = new Date(histTask.completedAt || histTask.updatedAt).toLocaleDateString("en-US", {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    });
                    
                    return (
                      <Card 
                        key={histTask._id} 
                        onClick={() => setSelectedHistoryTask(histTask)}
                        className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-violet-500/20 active:scale-[0.99] transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">Completed MCQ</p>
                            <h4 className="text-xs font-black text-slate-850 dark:text-white mt-1 leading-tight">{dateStr}</h4>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-lg">
                            {histTask.score}/{histTask.questions?.length || 0}
                          </span>
                          <ChevronRight size={16} className="text-slate-400" />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

        </div>

        {/* ── CLASS LEADERBOARD MODAL ── */}
        <AnimatePresence>
          {showLeaderboardModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLeaderboardModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-sm rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] p-6 flex flex-col max-h-[80vh] shadow-2xl text-slate-800 dark:text-slate-100"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-black tracking-wider uppercase flex items-center gap-2">
                    🏆 Class {student?.class || "12"}th Leaderboard
                  </h3>
                  <button 
                    onClick={() => setShowLeaderboardModal(false)}
                    className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <XCircle size={16} />
                  </button>
                </div>

                {/* Leaderboard Table headers */}
                <div className="grid grid-cols-12 gap-1 mt-4 px-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-2 border-b border-slate-100 dark:border-slate-800 text-center">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-4 text-left">Name</div>
                  <div className="col-span-2">Class</div>
                  <div className="col-span-2">XP</div>
                  <div className="col-span-2">Streak</div>
                </div>

                {/* Leaderboard Records list */}
                <div className="flex-1 overflow-y-auto py-2 space-y-2 no-scrollbar max-h-[45vh] mt-2">
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-xs font-bold text-slate-400 py-8">No leaderboard data found.</p>
                  ) : (
                    leaderboard.map((user: any, idx: number) => (
                      <div 
                        key={user._id}
                        className={cn(
                          "grid grid-cols-12 gap-1 items-center p-2 rounded-xl border text-xs text-center font-bold",
                          user.fullName === student.fullName
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                            : "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20"
                        )}
                      >
                        {/* Rank */}
                        <div className={cn(
                          "col-span-2 font-black",
                          idx === 0 ? "text-yellow-500 text-sm" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-slate-400"
                        )}>
                          {idx + 1}
                        </div>

                        {/* Name */}
                        <div className="col-span-4 flex items-center gap-2 min-w-0 text-left">
                          <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-800 shrink-0">
                            <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} />
                            <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-black text-slate-800 dark:text-slate-200 truncate">
                            {user.nickname || user.fullName?.split(' ')[0] || "User"}
                          </span>
                        </div>

                        {/* Class */}
                        <div className="col-span-2 text-slate-500 font-bold">
                          {user.class || student?.class || "12"}
                        </div>

                        {/* MCQ Points (XP) */}
                        <div className="col-span-2 text-cyan-500 font-black">
                          {user.mcqPoints || 0}
                        </div>

                        {/* Streak */}
                        <div className="col-span-2 text-orange-500 font-black">
                          🔥{user.streak || 0}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-center">
                  <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Rankings updated daily based on quiz activity</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── HISTORY REVIEW MODAL ── */}
        <AnimatePresence>
          {selectedHistoryTask && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedHistoryTask(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-[2.5rem] border border-slate-100 dark:border-[#221c4e] bg-[#f4f6ff] dark:bg-[#0b081e] p-5 flex flex-col max-h-[85vh] shadow-2xl text-slate-800 dark:text-slate-100"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
                  <div>
                    <h3 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-white">
                      Practice History Review
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
                      {new Date(selectedHistoryTask.completedAt || selectedHistoryTask.updatedAt).toLocaleDateString("en-US", {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })} • Score: {selectedHistoryTask.score}/{selectedHistoryTask.questions?.length}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedHistoryTask(null)}
                    className="h-7 w-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <XCircle size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 no-scrollbar">
                  {selectedHistoryTask.questions.map((q: any, idx: number) => {
                    const savedAns = selectedHistoryTask.answers?.find((a: any) => a.questionIndex === idx);
                    const selectedIdx = savedAns?.selectedAnswer;
                    const selectedLetter = selectedIdx !== undefined ? String.fromCharCode(65 + selectedIdx) : "";
                    const correctLetter = String.fromCharCode(65 + q.correctAnswer);
                    const isCorrect = selectedLetter === correctLetter;
                    
                    return (
                      <Card key={q._id || idx} className="border border-slate-100 dark:border-slate-800 rounded-3xl p-5 bg-white dark:bg-[#161233] text-left">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              Question {idx + 1}
                            </span>
                            <span className={cn(
                              "text-[9px] font-black uppercase px-2.5 py-1 rounded-full",
                              isCorrect 
                                ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                                : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                            )}>
                              {isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-850 dark:text-white leading-snug">
                            {q.question}
                          </h4>
                          
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt: string, i: number) => {
                              const optLetter = String.fromCharCode(65 + i);
                              const isUserSelected = selectedLetter === optLetter;
                              const isCorrectOpt = correctLetter === optLetter;
                              
                              let optStyle = "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20";
                              let badgeStyle = "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-450";
                              
                              if (isCorrectOpt) {
                                optStyle = "border-green-500 bg-green-50/30 dark:bg-green-950/10";
                                badgeStyle = "bg-green-600 border-green-600 text-white";
                              } else if (isUserSelected && !isCorrectOpt) {
                                optStyle = "border-red-500 bg-red-50/30 dark:bg-red-950/10";
                                badgeStyle = "bg-red-600 border-red-600 text-white";
                              }
                              
                              return (
                                <div key={optLetter} className={cn("border rounded-xl px-3 py-2 flex items-center gap-3 text-xs font-bold transition-all", optStyle)}>
                                  <div className={cn("h-6 w-6 shrink-0 flex items-center justify-center rounded-full text-[10px] font-black border", badgeStyle)}>
                                    {optLetter}
                                  </div>
                                  <span className={cn(
                                    "leading-tight",
                                    isCorrectOpt ? "text-green-700 dark:text-green-400" : isUserSelected ? "text-red-700 dark:text-red-400" : "text-slate-650 dark:text-slate-350"
                                  )}>
                                    {opt}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-svh bg-[#f4f6ff] dark:bg-[#0b081e] flex items-center justify-center text-slate-500 font-bold">Loading Questions...</div>;

  if (!questions.length) {
    return (
      <div className="min-h-svh bg-[#f4f6ff] dark:bg-[#0b081e] flex flex-col items-center justify-center text-slate-850 gap-4 px-6 text-center">
        <p className="text-slate-500 font-bold">No MCQ questions available today.</p>
        <Button 
          onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs uppercase"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // ── NEW PREMIUM RESULT SCREEN ──
  if (isFinished || isAlreadyDone) {
    const score = isAlreadyDone ? (task?.score ?? 0) : calculateScore();
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const pts = isAlreadyDone ? (task?.pointsEarned ?? 0) : (score * 5);

    const chartData = [
      { name: "Correct", value: score, color: "#22c55e" },
      { name: "Wrong", value: totalQuestions - score, color: "#ef4444" },
    ];

    return (
      <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-xl w-full flex flex-col min-h-svh pb-24">

          {/* Header Section */}
          <header className="w-full flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-900 pb-4">
            <div className="flex items-center gap-3 text-left">
              <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
                <AvatarImage src={student?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.fullName || 'Student'}`} />
                <AvatarFallback>{student?.fullName?.[0] || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Test Completed! 🎉</p>
                <h1 className="text-base font-black text-slate-850 dark:text-white leading-tight">Well Done, {student?.fullName?.split(' ')[0] || 'Student'}!</h1>
              </div>
            </div>
            <div className="bg-emerald-550/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-500">
              <BookText className="h-5 w-5" />
            </div>
          </header>

          <main className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 w-full">
              <StatCard label="Score" value={`${score}/${totalQuestions}`} sub="TOTAL SCORE" color="cyan" />
              <StatCard label="Accuracy" value={`${accuracy}%`} sub="QUIZ ACCURACY" color="cyan" />
              <StatCard label="XP Earned" value={`${score * 10} XP`} sub="LEADERBOARD XP" color="cyan" />
              <StatCard label="PTS Earned" value={`${pts} PTS`} sub="WALLET REWARD" color="gold" />
            </div>

            {/* Pie Chart Card */}
            <Card className="w-full border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] shadow-sm">
              <CardContent className="flex flex-col items-center py-6">
                <h3 className="text-sm font-black mb-3 text-slate-800 dark:text-white">Correct vs Wrong Answers</h3>
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={450} stroke="none">
                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-850 dark:text-white">{accuracy}%</span>
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Accuracy</span>
                  </div>
                </div>
                <div className="flex gap-8 mt-5">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-350">Correct ({score})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-350">Wrong ({totalQuestions - score})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Review List */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider pl-1">
                Question Review
              </h3>
              <div className="space-y-3">
                {questions.map((q: any, idx: number) => {
                  const userAnswer = userAnswers[idx];
                  const isCorrect = userAnswer === q.correctAnswer;
                  
                  return (
                    <Card key={q.id} className="border border-slate-100 dark:border-slate-800 rounded-3xl p-5 bg-white dark:bg-[#161233]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                            Question {idx + 1}
                          </span>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2.5 py-1 rounded-full",
                            isCorrect 
                              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                              : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                          )}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-850 dark:text-white leading-snug">
                          {q.question}
                        </h4>
                        
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt: any) => {
                            const isUserSelected = userAnswer === opt.id;
                            const isCorrectOpt = q.correctAnswer === opt.id;
                            
                            let optStyle = "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20";
                            let badgeStyle = "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-450";
                            
                            if (isCorrectOpt) {
                              optStyle = "border-green-500 bg-green-50/30 dark:bg-green-950/10";
                              badgeStyle = "bg-green-600 border-green-600 text-white";
                            } else if (isUserSelected && !isCorrectOpt) {
                              optStyle = "border-red-500 bg-red-50/30 dark:bg-red-950/10";
                              badgeStyle = "bg-red-600 border-red-600 text-white";
                            }
                            
                            return (
                              <div key={opt.id} className={cn("border rounded-xl px-3 py-2 flex items-center gap-3 text-xs font-bold transition-all", optStyle)}>
                                <div className={cn("h-6 w-6 shrink-0 flex items-center justify-center rounded-full text-[10px] font-black border", badgeStyle)}>
                                  {opt.id}
                                </div>
                                <span className={cn(
                                  "leading-tight",
                                  isCorrectOpt ? "text-green-700 dark:text-green-400" : isUserSelected ? "text-red-700 dark:text-red-400" : "text-slate-650 dark:text-slate-350"
                                )}>
                                  {opt.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full">
              <button
                onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-4 py-4 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl w-full flex-1 flex flex-col h-full justify-between pb-2">
        
        <header className="relative z-10 flex w-full items-center justify-between mb-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowExitWarning(true)} 
            className="h-9 w-9 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </Button>
          <div className="text-center">
            <h1 className="text-[10px] font-black tracking-widest text-slate-450 uppercase">VLM Academy</h1>
            <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold tracking-wider uppercase">QUESTION {currentIndex + 1} / {totalQuestions}</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-850 dark:text-white/80 font-mono text-xs font-black">
            <Clock size={14} className={timeLeft < 60 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"} /> 
            <span className={timeLeft < 60 ? "text-rose-500" : ""}>{formatTime(timeLeft)}</span>
          </div>
        </header>

        <div className="w-full space-y-1 mb-2">
          <Progress value={progressValue} className="h-1 bg-slate-200 dark:bg-slate-850" />
        </div>

        <main className="w-full flex-1 flex flex-col animate-in fade-in duration-500 overflow-hidden">
          <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2rem] flex-1 flex flex-col justify-between shadow-sm p-5 text-left overflow-hidden">
            <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
              <div className="space-y-2">
                <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Question</span>
                <h2 className="text-base font-black text-slate-855 dark:text-white leading-snug break-words">{currentQuestion.question}</h2>
              </div>
              
              <div className="space-y-2.5 py-2">
                {currentQuestion.options.map((option: McqOption) => {
                  const isSelected = userAnswers[currentIndex] === option.id;
                  return (
                    <Card 
                      key={option.id} 
                      onClick={() => handleSelect(option.id)} 
                      className={cn(
                        "cursor-pointer border rounded-2xl transition-all duration-200", 
                        isSelected 
                          ? "border-violet-500 bg-violet-500/10 shadow-sm" 
                          : "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 hover:border-violet-500/20"
                      )}
                    >
                      <CardContent className="px-4 py-2.5 flex items-center gap-3 text-left">
                        <div className={cn(
                          "h-6.5 w-6.5 shrink-0 flex items-center justify-center rounded-full text-xs font-black border", 
                          isSelected 
                            ? "bg-violet-600 border-violet-600 text-white" 
                            : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-450"
                        )}>
                          {option.id}
                        </div>
                        <p className={cn("text-xs font-black leading-tight", isSelected ? "text-slate-800 dark:text-white" : "text-slate-650 dark:text-slate-350")}>
                          {option.text}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex justify-end shrink-0">
              <Button 
                onClick={handleNext} 
                disabled={!userAnswers[currentIndex]} 
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/20 cursor-pointer border-none"
              >
                {currentIndex === totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
                <ArrowRight size={14} />
              </Button>
            </div>
          </Card>
        </main>

      </div>

      {/* Exit Warning Dialog */}
      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] text-slate-800 dark:text-slate-100 w-[90%] rounded-[2rem] max-w-sm p-6 text-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-black uppercase tracking-tight">Exit MCQ Test?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed pt-1">
              Are you sure you want to return to the dashboard? Your answers will not be submitted and your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2.5 sm:gap-0">
            <AlertDialogCancel className="h-11 rounded-xl border-slate-200 dark:border-[#221c4e] bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs">
              Continue Test
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
              className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs border-none"
            >
              Exit & Lose Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Internal Result Components ──
function StatCard({ label, value, sub, color }: any) {
  const isGold = color === "gold";
  return (
    <Card className={cn(
      "bg-white dark:bg-[#161233] rounded-[2rem] border text-center py-4 px-2 shadow-sm", 
      isGold 
        ? "border-yellow-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]" 
        : "border-slate-100 dark:border-[#221c4e]"
    )}>
      <div className="space-y-1">
        <p className="text-[9px] font-black tracking-wider text-slate-400 dark:text-slate-550 uppercase">{label}</p>
        <h2 className={cn("text-lg font-black", isGold ? "text-yellow-500" : "text-cyan-500")}>{value}</h2>
        <p className="text-[7px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">{sub}</p>
      </div>
    </Card>
  );
}