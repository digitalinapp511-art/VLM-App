import {studentApi} from "@/lib/student-api";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Clock,  ArrowRight, 
  ChevronRight, BookOpen, Calendar, BookText, XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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


const fetchQuizData = async () => {
  const { questions } = await studentApi.getDailyMcq();
  return (questions ?? []).map((q: any) => ({
    id: q.id,
    question: q.question,
    options: (q.options as string[]).map((opt: string, i: number) => ({
      id: String.fromCharCode(65 + i),
      text: opt,
    })),
    correctAnswer: String.fromCharCode(65 + (q.options as string[]).indexOf(q.answer)),
    _dbAnswer: q.answer,
  }));
};

export default function Mcq() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const { data: questions, isLoading } = useQuery<McqQuestion[]>({
    queryKey: ["quizQuestions"],
    queryFn: fetchQuizData,
  });

  if (isLoading) return <div className="min-h-svh bg-black flex items-center justify-center text-white">Loading Questions...</div>;

  if (!questions?.length) {
    return (
      <div className="min-h-svh bg-black flex flex-col items-center justify-center text-white gap-4 px-6">
        <p className="text-white/60">No MCQ questions available today.</p>
        <Button onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}>Back to Dashboard</Button>
      </div>
    );
  }

  const currentQuestion = questions![currentIndex];
  const totalQuestions = questions!.length;
  const progressValue = ((currentIndex) / totalQuestions) * 100;

  const handleSelect = (optionId: string) => {
    setUserAnswers({ ...userAnswers, [currentIndex]: optionId });
  };

  const handleNext = async () => {
    // Submit answer to API (fire and forget)
    const selected = userAnswers[currentIndex];
    if (selected && currentQuestion.id) {
      try {
        const dbAnswer = currentQuestion.options.find((o: McqOption) => o.id === selected)?.text;
        if (dbAnswer) await studentApi.submitMcq(String(currentQuestion.id), dbAnswer);
      } catch { /* non-blocking */ }
    }
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions?.forEach((q: McqQuestion, index: number) => {
      if (userAnswers[index] === q.correctAnswer) score++;
    });
    return score;
  };

  // ── NEW PREMIUM RESULT SCREEN ──
  if (isFinished) {
    const score = calculateScore();
    const accuracy = Math.round((score / totalQuestions) * 100);
    const pts = score * 25; // Example logic: 25 pts per correct answer

    const chartData = [
      { name: "Correct", value: score, color: "#f5a623" },
      { name: "Wrong", value: totalQuestions - score, color: "#1a1a1a" },
    ];

    return (
      <div className="relative min-h-svh w-full bg-linear-to-br/srgb from-teal-900 from-0% via-black via-40% to-purple-600 to-210% text-white flex flex-col items-center px-6 py-10 overflow-x-hidden">
        <div className="max-w-xl">

        {/* Header Section */}
        <header className="w-full max-w-xl flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(245,166,35,0.3)]">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan" />
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs      text-white/50">Test Completed! 🎉</p>
              <h1 className="text-lg    old tracking-tight">Well Done, Aryan!</h1>
            </div>
          </div>
          <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/50">
            <BookText className="text-green-500 h-4 w-4" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xl mb-3">
          <StatCard label="Score" value={`${score}/${totalQuestions}`} sub="TOTAL SCORE" color="cyan" />
          <StatCard label="Accuracy" value={`${accuracy}%`} sub="QUIZ ACCURACY" color="cyan" />
          <StatCard label="PTS Earned" value={`${pts} PTS`} sub="PTS REWARD" color="gold" />
        </div>

        {/* Pie Chart Card */}
        <Card className="w-full max-w-xl  bg-transparent backdrop-blur-xl rounded-[2.5rem] mb-3">
          <CardContent className="flex flex-col items-center py-">
            <h3 className="text-lg    old mb-0">Correct vs Wrong Answers</h3>
            <div className="relative h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={0} outerRadius={100} dataKey="value" startAngle={90} endAngle={450} stroke="none">
                    {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-10 right-10 bg-red-500 rounded-full p-0.5 border-2 border-black shadow-lg">
                <XCircle size={16} className="text-white fill-current" strokeWidth={3} />
              </div>
            </div>
            <div className="flex gap-8 mt-0">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm      text-white/90">Correct ({score})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm      text-white/90">Wrong ({totalQuestions - score})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="w-full max-w-xl space-y-3">
          <ActionCard
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            icon={<BookOpen />} title="View Explanation" desc="Revise key concepts"
            color="bg-purple-600/20 border-purple-500/30" glow="shadow-[0_0_20px_rgba(168,85,247,0.15)]" iconBg="bg-purple-500/30"
          />
          <ActionCard
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            icon={<Calendar />} title="Start Revision Tomorrow" desc="Revise concepts and lock in your points!"
            color="bg-orange-600/20 border-orange-500/30" glow="shadow-[0_0_20px_rgba(245,158,11,0.15)]" iconBg="bg-orange-500/30"
          />
        </div>
      </div>
        </div>

    );
  }

  // ── MAIN MCQ UI (Unchanged, just layout fixes) ──
  return (
    <div className="bg-linear-to-br/srgb from-teal-900 from-0% via-black via-40% to-purple-600 to-210% relative flex min-h-svh w-full flex-col items-center px-6 pt-10 overflow-hidden text-white">
      <div className="max-w-lg w-full">
        <header className="relative z-10 flex w-full items-center justify-between mb-2">
          <Button variant="outline" size="icon" onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} className="rounded-xl border-white/10 bg-white/5">
            <ChevronLeft size={20} />
          </Button>
          <div className="text-center">
            <h1 className="text-sm tracking-tight">VLM Academy</h1>
            <p className="text-xs text-white/40 tracking-wider">QUESTION {currentIndex + 1} / {totalQuestions}</p>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 font-mono text-sm">
            <Clock size={16} className="text-white/40" /> 12:35
          </div>
        </header>

        <div className="w-sm m-auto max-w-xl space-y-2 mb-3">
          <Progress value={progressValue} className="h-1.5 bg-white/10" />
        </div>

        <Card className="relative border-1 border-cyan-400 bg-transparent z-10 w-full max-w-xl backdrop-blur-3xl rounded-[2.5rem] flex-1 mb-6">
          <CardContent className="px-6 py-2 flex flex-col h-full">
            <div className="space-y-3 mb-6">
              <p className="text-xs tracking-widest text-white/30 uppercase">Question</p>
              <h2 className="text-xl leading-snug text-white    old">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-4 flex-1">
              {currentQuestion.options.map((option: McqOption) => {
                const isSelected = userAnswers[currentIndex] === option.id;
                return (
                  <Card key={option.id} onClick={() => handleSelect(option.id)} className={cn("cursor-pointer border-2 bg-transparent rounded-[1.5rem] transition-all", isSelected ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(0,242,255,0.15)]" : "border-white/5")}>
                    <CardContent className="px-6 py-1 flex items-center gap-5">
                      <div className={cn("h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-sm border    old", isSelected ? "bg-cyan-400 border-cyan-400 text-black" : "bg-white/5 border-white/20 text-white/40")}>{option.id}.</div>
                      <p className={cn("text-sm", isSelected ? "text-white" : "text-white/60")}>{option.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end relative">
               <div className="absolute inset-0 bg-blue-600/30 blur-2xl rounded-full" />
               <Button onClick={handleNext} disabled={!userAnswers[currentIndex]} className="relative h-14 px-8 rounded-full text-white bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40    old">
                {currentIndex === totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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