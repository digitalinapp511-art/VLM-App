import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Star, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { studentApi } from "@/lib/student-api";
import { PATHS } from "@/routes/paths";
import { useStudentProfile } from "@/hooks/use-student";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const SEGMENTS = [
  { label: "50", sub: "POINTS", color: "#ff4b5c" },
  { label: "₹100", sub: "OFF", color: "#ff9233" },
  { label: "10", sub: "CREDITS", color: "#ffcd3c" },
  { label: "25", sub: "POINTS", color: "#3de6af" },
  { label: "TRY", sub: "AGAIN", color: "#20d3f2" },
  { label: "5", sub: "CREDITS", color: "#4b89ff" },
  { label: "100", sub: "POINTS", color: "#7c3aed" },
  { label: "TRY", sub: "AGAIN", color: "#a855f7" },
];

export default function SpinnerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, refetch: refetchProfile } = useStudentProfile();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [wonReward, setWonReward] = useState<{ label: string; sub: string } | null>(null);
  const [localLastSpin, setLocalLastSpin] = useState<string | null>(null);

  const p = (profile as any)?.data ?? profile;
  const lastSpinDateStr = localLastSpin || p?.lastSpinDate;

  // ── Sync Timer with Last Spin Date from DB ──
  useEffect(() => {
    if (lastSpinDateStr) {
      const calculateSecondsRemaining = () => {
        const lastSpin = new Date(lastSpinDateStr).getTime();
        const diffMs = Date.now() - lastSpin;
        const remSeconds = Math.max(0, Math.ceil((24 * 3600 * 1000 - diffMs) / 1000));
        setSecondsLeft(remSeconds);
      };
      
      calculateSecondsRemaining();
      const interval = setInterval(calculateSecondsRemaining, 1000);
      return () => clearInterval(interval);
    } else {
      setSecondsLeft(0);
    }
  }, [lastSpinDateStr]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return { h, m, s };
  };
  const { h, m, s } = formatTime(secondsLeft);

  const canSpin = secondsLeft <= 0;

  // ── Hardware Accelerated Spin Logic ──
  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    // 5 minimum rotations (1800deg) + random angle
    const randomDegree = Math.floor(Math.random() * 360);
    const totalNewRotation = rotation + 1800 + randomDegree;
    
    setRotation(totalNewRotation);

    // After animation ends (5s)
    setTimeout(async () => {
      setIsSpinning(false);
      setLocalLastSpin(new Date().toISOString());
      const normalizedDegree = (totalNewRotation % 360);
      const stopAngle = (360 - normalizedDegree) % 360;
      const segmentIndex = Math.floor(stopAngle / (360 / SEGMENTS.length));
      const reward = SEGMENTS[segmentIndex];
      
      setWonReward(reward);
      setShowRewardModal(true);
      
      if (reward.label !== "TRY" && reward.sub !== "OFF") {
        try {
          await studentApi.claimSpinReward({ rewardType: reward.sub, amount: parseInt(reward.label) });
          queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          refetchProfile(); // Instantly update lastSpinDate to start timer
        } catch (e) {
          console.error("Failed to claim spin reward", e);
        }
      } else {
        // Even if TRY AGAIN, register spin event so user waits 24h
        try {
          await studentApi.claimSpinReward({ rewardType: "TRY_AGAIN", amount: 0 });
          queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          refetchProfile();
        } catch (e) {
          console.error("Failed to register try again spin", e);
        }
      }
    }, 5000);
  };

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-violet-600/5 dark:bg-cyan-500/10 blur-[100px]" />
      <Star className="absolute top-10 left-10 text-slate-200 dark:text-white/10" size={16} />

      {/* ── HEADER ── */}
      <header className="relative w-full max-w-sm flex items-center justify-between mb-8 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
          className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-center flex-1 pr-10">
          <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">VLM Academy</h1>
          <p className="text-[9px] tracking-wider text-slate-400 dark:text-slate-500 font-bold mt-0.5 uppercase">Learn Without Limits</p>
        </div>
      </header>

      {/* ── THE WHEEL CONTAINER ── */}
      <div className="relative flex items-center justify-center w-full max-w-[340px] aspect-square">
        
        {/* Fixed Pointer */}
        <div className="absolute -top-4 z-40 drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-violet-500" />
        </div>

        {/* Outer Static Border */}
        <div className="absolute inset-0 rounded-full border-[10px] border-white dark:border-[#1a1a1a] shadow-2xl z-10" />

        {/* Hardware Accelerated Rotating Wheel using Framer Motion */}
        <motion.div
          className="relative w-full h-full rounded-full border border-white/5 overflow-hidden shadow-inner"
          animate={{ rotate: rotation }}
          transition={{
            type: "tween",
            duration: 5,
            ease: [0.15, 0, 0.15, 1] // Smooth stop
          }}
          style={{ 
            willChange: 'transform', // Forces GPU rendering
            background: `conic-gradient(from 0deg, ${SEGMENTS.map((s, i) => `${s.color} ${i * 45}deg ${(i + 1) * 45}deg`).join(", ")})` 
          }}
        >
          {SEGMENTS.map((seg, i) => (
            <div
              key={i}
              className="absolute top-0 left-0 w-full h-full flex justify-center pt-8"
              style={{ transform: `rotate(${i * 45 + 22.5}deg)` }}
            >
              <div className="flex flex-col items-center pointer-events-none">
                <span className="text-xl font-black text-white leading-none">{seg.label}</span>
                <span className="text-[7px] font-black tracking-widest text-white/70 mt-1 uppercase">{seg.sub}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Center Hub */}
        <div className="absolute z-30 h-16 w-16 bg-white dark:bg-[#0a0a0a] rounded-full border-[4px] border-violet-500 flex items-center justify-center shadow-2xl">
          <ChevronDown className="text-violet-500 h-8 w-8" />
        </div>
      </div>

      {/* ── SPIN BUTTON ── */}
      <div className="mt-5 w-full max-w-sm relative">
        <div className="absolute inset-0 bg-violet-600/10 dark:bg-violet-600/20 blur-3xl rounded-full" />
        <Button
          onClick={handleSpin}
          disabled={!canSpin || isSpinning}
          className={`relative w-full h-16 rounded-full text-lg font-black tracking-widest transition-all active:scale-95 border text-white shadow-xl ${
            canSpin 
              ? "bg-gradient-to-b from-[#2a4e9b] to-[#0a0f1d] border-cyan-400/40" 
              : "bg-gradient-to-b from-neutral-800 to-neutral-900 border-neutral-700 cursor-not-allowed opacity-60"
          }`}
        >
          <div className="flex flex-col">
            <span className="leading-none tracking-[0.1em]">
              {!canSpin ? "SPIN TODAY" : "SPIN NOW"}
            </span>
            <span className="text-[9px] font-medium opacity-50 tracking-normal mt-1 italic capitalize">
              {!canSpin ? "Come back tomorrow!" : "Daily free spin!"}
            </span>
          </div>
        </Button>
      </div>

      {/* ── TIMER CARD ── */}
      {!canSpin && (
        <Card className="mt-4 w-full max-w-[340px] border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm rounded-3xl py-4">
          <CardContent className="flex flex-col items-center space-y-5 p-0">
            <div className="text-center space-y-1">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-slate-800 dark:text-slate-100">DAILY REWARDS</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">Next free spin in:</p>
            </div>

            <div className="flex items-center gap-3">
               <TimerBox value={h} />
               <span className="text-slate-350 dark:text-slate-655 font-bold">:</span>
               <TimerBox value={m} />
               <span className="text-slate-350 dark:text-slate-655 font-bold">:</span>
               <TimerBox value={s} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── CUSTOM REWARD POPUP ── */}
      <AnimatePresence>
        {showRewardModal && wonReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-[2rem] border border-yellow-500/30 bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col items-center gap-6"
            >
              <div className="absolute -top-12 w-24 h-24 rounded-full bg-yellow-500/20 blur-xl pointer-events-none animate-pulse" />

              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/40 flex items-center justify-center text-4xl animate-bounce">
                {wonReward.label === "TRY" ? "😢" : "🎉"}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-yellow-400 font-serif">
                  {wonReward.label === "TRY" ? "TRY AGAIN!" : "CONGRATULATIONS!"}
                </h2>
                <p className="text-white/60 text-xs tracking-wide">
                  {wonReward.label === "TRY" 
                    ? "Better luck next time! Your daily spin has been used." 
                    : "You just won a special reward from the lucky wheel!"}
                </p>
              </div>

              <div className="py-4 px-8 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                <span className="text-4xl font-black text-white tracking-wide block">
                  {wonReward.label}
                </span>
                <span className="text-xs font-black tracking-[0.2em] text-yellow-500 uppercase mt-1 block">
                  {wonReward.sub}
                </span>
              </div>

              <Button
                onClick={() => setShowRewardModal(false)}
                className="w-full h-12 rounded-full font-bold text-sm bg-yellow-500 hover:bg-yellow-400 text-black border-none shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 transition-all"
              >
                Claim Reward
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimerBox({ value }: { value: string }) {
  return (
    <div className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm">
      <span className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono tabular-nums">{value}</span>
    </div>
  );
}