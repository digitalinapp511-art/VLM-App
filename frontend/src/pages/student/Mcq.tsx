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
      <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center p-6 overflow-y-auto no-scrollbar", bgCss)}>
        {/* Background Decor Glows */}
        <div className="absolute top-[10%] left-[-20%] h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md flex flex-col z-10 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
              className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
            >
              <ChevronLeft size={18} />
            </Button>
            <h1 className="text-sm font-bold tracking-tight text-white/90">Daily MCQ Challenge</h1>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowLeaderboardModal(true)}
              className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md"
              title="Class Leaderboard"
            >
              <Trophy size={18} className="text-yellow-400" />
            </Button>
          </div>

          {/* STREAK VIEW CARD (SHRINKED / COMPACT) */}
          <div className="relative w-full rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0b3c43] to-[#011417] p-5 flex flex-col items-center shadow-xl text-center">
            {/* Water-drop / Flame gradient SVG icon (smaller) */}
            <div className="relative flex items-center justify-center mb-2">
              <div className="absolute inset-0 h-16 w-16 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
              <svg className="h-14 w-14 relative z-10 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="dropGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <path d="M50 15C50 15 80 45 80 65C80 81.5685 66.5685 95 50 95C33.4315 95 20 81.5685 20 65C20 45 50 15 50 15Z" fill="url(#dropGrad)" />
                <path d="M50 35C50 35 68 55 68 68C68 77.9411 59.9411 86 50 86C40.0589 86 32 77.9411 32 68C32 55 50 35 50 35Z" fill="white" fillOpacity="0.15" />
              </svg>
            </div>

            <h2 className="text-base font-bold tracking-wide text-white">MCQ Streak</h2>
            <div className="text-4xl font-black tracking-tight text-cyan-400 my-1 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
              {streak}
            </div>
            <p className="text-[9px] text-white/50 tracking-wider uppercase font-semibold">Current Streak Days</p>

            {/* Streak Calendar Box */}
            <div className="mt-4 w-full rounded-xl bg-black/40 border border-white/5 p-3 flex flex-col items-center">
              <p className="text-[10px] font-bold text-white/70 tracking-wider mb-2">Streak Calendar</p>
              <div className="grid grid-cols-7 gap-1.5 w-full">
                {daysOfWeek.map((day, idx) => {
                  const isCompleted = completedDays.includes(idx);
                  const isToday = idx === todayDayIndex;
                  const isPast = idx < todayDayIndex;
                  return (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <span className={cn("text-[8px] font-bold", isToday ? "text-cyan-400" : "text-white/40")}>{day}</span>
                      <div 
                        className={cn(
                          "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all text-xs",
                          isCompleted
                            ? isToday
                              ? "bg-[#00d8ff] border-[#00d8ff] text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                              : "border-cyan-500/50 bg-cyan-950/20 text-cyan-400"
                            : isPast
                              ? "border-red-500/30 bg-red-950/10 text-red-500"
                              : isToday
                                ? "border-cyan-500 bg-transparent text-white/20 animate-pulse"
                                : "border-white/10 bg-white/5 text-transparent"
                        )}
                      >
                        {isCompleted || (isToday && isAlreadyDone) ? (
                          <svg className="h-3 w-3 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isPast ? (
                          <svg className="h-3 w-3 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          <div className="w-full pt-1">
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
                "w-full h-14 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-lg active:scale-95 cursor-pointer",
                isAlreadyDone
                  ? "bg-green-500/20 border border-green-500/30 text-green-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
              )}
            >
              Daily MCQ
            </Button>
          </div>

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
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-[24px] border border-white/10 bg-zinc-950 p-6 flex flex-col max-h-[85vh] shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    🏆 Class {student?.class || "12"}th Leaderboard
                  </h3>
                  <button 
                    onClick={() => setShowLeaderboardModal(false)}
                    className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
                  >
                    <XCircle size={16} />
                  </button>
                </div>

                {/* Leaderboard Table headers: Name, Class, Pts, Streak */}
                <div className="grid grid-cols-12 gap-2 mt-4 px-2 text-[10px] font-bold text-white/40 uppercase tracking-wider pb-2 border-b border-white/5">
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-4 text-left">Name</div>
                  <div className="col-span-2 text-center">Class</div>
                  <div className="col-span-2 text-center">Pts</div>
                  <div className="col-span-2 text-center">Streak</div>
                </div>

                {/* Leaderboard Records list */}
                <div className="flex-1 overflow-y-auto py-2 space-y-2.5 no-scrollbar max-h-[50vh]">
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-xs text-white/30 py-8">No leaderboard data found.</p>
                  ) : (
                    leaderboard.map((user: any, idx: number) => (
                      <div 
                        key={user._id}
                        className={cn(
                          "grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border text-xs",
                          user.fullName === student.fullName
                            ? "border-cyan-400/20 bg-cyan-400/5"
                            : "border-white/[0.02] bg-white/[0.01]"
                        )}
                      >
                        {/* Rank */}
                        <div className={cn(
                          "col-span-2 font-black text-center",
                          idx === 0 ? "text-yellow-400 text-sm" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-white/40"
                        )}>
                          {idx + 1}
                        </div>

                        {/* Name */}
                        <div className="col-span-4 flex items-center gap-2 min-w-0">
                          <Avatar className="h-6 w-6 border border-white/10 shrink-0">
                            <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} />
                            <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-white/90 truncate">
                            {user.nickname || user.fullName?.split(' ')[0] || "User"}
                          </span>
                        </div>

                        {/* Class */}
                        <div className="col-span-2 text-center text-white/60 font-semibold">
                          {user.class || student?.class || "12"}
                        </div>

                        {/* Pts */}
                        <div className="col-span-2 text-center text-cyan-400 font-bold">
                          {user.totalPoints || 0}
                        </div>

                        {/* Streak */}
                        <div className="col-span-2 text-center text-orange-400 font-bold">
                          🔥 {user.streak || 0}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 text-center">
                  <p className="text-[10px] text-white/30">Rankings updated daily based on quiz activity</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-svh bg-black flex items-center justify-center text-white">Loading Questions...</div>;

  if (!questions.length) {
    return (
      <div className="min-h-svh bg-black flex flex-col items-center justify-center text-white gap-4 px-6">
        <p className="text-white/60">No MCQ questions available today.</p>
        <Button onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}>Back to Dashboard</Button>
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
      { name: "Correct", value: score, color: "#f5a623" },
      { name: "Wrong", value: totalQuestions - score, color: "#1a1a1a" },
    ];

    return (
      <div className="relative min-h-svh w-full bg-linear-to-br/srgb from-teal-900 from-0% via-black via-40% to-purple-600 to-210% text-white flex flex-col items-center px-6 py-10 overflow-x-hidden">
        <div className="max-w-xl w-full">

        {/* Header Section */}
        <header className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(245,166,35,0.3)]">
              <AvatarImage src={student?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.fullName || 'Student'}`} />
              <AvatarFallback>{student?.fullName?.[0] || 'S'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-white/50">Test Completed! 🎉</p>
              <h1 className="text-lg font-bold tracking-tight">Well Done, {student?.fullName?.split(' ')[0] || 'Student'}!</h1>
            </div>
          </div>
          <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/50">
            <BookText className="text-green-500 h-4 w-4" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-3">
          <StatCard label="Score" value={`${score}/${totalQuestions}`} sub="TOTAL SCORE" color="cyan" />
          <StatCard label="Accuracy" value={`${accuracy}%`} sub="QUIZ ACCURACY" color="cyan" />
          <StatCard label="PTS Earned" value={`${pts} PTS`} sub="PTS REWARD" color="gold" />
        </div>

        {/* Pie Chart Card */}
        <Card className="w-full bg-transparent backdrop-blur-xl rounded-[2.5rem] mb-3">
          <CardContent className="flex flex-col items-center py-4">
            <h3 className="text-sm font-bold mb-2">Correct vs Wrong Answers</h3>
            <div className="relative h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={0} outerRadius={80} dataKey="value" startAngle={90} endAngle={450} stroke="none">
                    {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-8 right-8 bg-red-500 rounded-full p-0.5 border-2 border-black shadow-lg">
                <XCircle size={16} className="text-white fill-current" strokeWidth={3} />
              </div>
            </div>
            <div className="flex gap-8 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs text-white/90">Correct ({score})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-xs text-white/90">Wrong ({totalQuestions - score})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <ActionCard
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            icon={<BookOpen />} title="Back to Dashboard" desc="Keep learning and revision concepts"
            color="bg-purple-600/20 border-purple-500/30" glow="shadow-[0_0_20px_rgba(168,85,247,0.15)]" iconBg="bg-purple-500/30"
          />
        </div>
      </div>
        </div>
    );
  }

  // ── MAIN MCQ UI ──
  return (
    <div className="bg-linear-to-br/srgb from-teal-900 from-0% via-black via-40% to-purple-600 to-210% relative flex min-h-svh w-full flex-col items-center px-6 pt-10 overflow-hidden text-white">
      <div className="max-w-lg w-full">
        <header className="relative z-10 flex w-full items-center justify-between mb-2">
          <Button variant="outline" size="icon" onClick={() => setShowExitWarning(true)} className="rounded-xl border-white/10 bg-white/5">
            <ChevronLeft size={20} />
          </Button>
          <div className="text-center">
            <h1 className="text-sm tracking-tight">VLM Academy</h1>
            <p className="text-xs text-white/40 tracking-wider">QUESTION {currentIndex + 1} / {totalQuestions}</p>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 font-mono text-sm">
            <Clock size={16} className={timeLeft < 60 ? "text-red-400" : "text-white/40"} /> 
            <span className={timeLeft < 60 ? "text-red-400" : ""}>{formatTime(timeLeft)}</span>
          </div>
        </header>

        <div className="w-sm m-auto max-w-xl space-y-2 mb-3">
          <Progress value={progressValue} className="h-1.5 bg-white/10" />
        </div>

        <Card className="relative border-1 border-cyan-400 bg-transparent z-10 w-full max-w-xl backdrop-blur-3xl rounded-[2.5rem] flex-1 mb-6">
          <CardContent className="px-6 py-2 flex flex-col h-full">
            <div className="space-y-3 mb-6">
              <p className="text-xs tracking-widest text-white/30 uppercase">Question</p>
              <h2 className="text-xl leading-snug text-white font-bold">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-4 flex-1">
              {currentQuestion.options.map((option: McqOption) => {
                const isSelected = userAnswers[currentIndex] === option.id;
                return (
                  <Card key={option.id} onClick={() => handleSelect(option.id)} className={cn("cursor-pointer border-2 bg-transparent rounded-[1.5rem] transition-all", isSelected ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(0,242,255,0.15)]" : "border-white/5")}>
                    <CardContent className="px-6 py-1 flex items-center gap-5">
                      <div className={cn("h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-sm border font-bold", isSelected ? "bg-cyan-400 border-cyan-400 text-black" : "bg-white/5 border-white/20 text-white/40")}>{option.id}.</div>
                      <p className={cn("text-sm", isSelected ? "text-white" : "text-white/60")}>{option.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end relative">
               <div className="absolute inset-0 bg-blue-600/30 blur-2xl rounded-full" />
               <Button onClick={handleNext} disabled={!userAnswers[currentIndex]} className="relative h-14 px-8 rounded-full text-white bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 font-bold">
                {currentIndex === totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exit Warning Dialog */}
      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white w-[90%] rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-serif">Exit MCQ Test?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to return to the dashboard? Your answers will not be submitted and your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white rounded-xl">Continue Test</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl border-none"
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
    <Card className={cn("bg-transparent backdrop-blur-md rounded-3xl border text-center py-5", isGold ? "border-yellow-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]")}>
      <div className="space-y-2">
        <p className="text-[9px]    old tracking-widest text-white/60 uppercase">{label}</p>
        <h2 className={cn("text-xl    lack", isGold ? "text-yellow-500" : "text-cyan-400")}>{value}</h2>
        <p className="text-[7px]    old text-white/20 uppercase">{sub}</p>
      </div>
    </Card>
  );
}

function ActionCard({ icon, title, desc, color, glow, iconBg, onClick }: any) {
  return (
    <Card onClick={onClick} className={cn("cursor-pointer rounded-3xl border transition-all active:scale-95", color, glow)}>
      <CardContent className="flex items-center gap-4 px-3 " >
        <div className={cn("h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border border-white/10", iconBg)}>{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm    old text-white tracking-tight">{title}</h3>
          <p className="text-[10px] text-white/40">{desc}</p>
        </div>
        <ChevronRight className="text-white/40" size={20} />
      </CardContent>
    </Card>
  );
}