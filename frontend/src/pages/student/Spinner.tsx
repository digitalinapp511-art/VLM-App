import { useState, useEffect } from "react";
import { ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { studentApi } from "@/lib/student-api";

const SEGMENTS = [
  { label: "50", sub: "POINTS", color: "#1a1a2e" },
  { label: "₹100", sub: "OFF", color: "#16213e" },
  { label: "10", sub: "CREDITS", color: "#1a1a2e" },
  { label: "25", sub: "POINTS", color: "#16213e" },
  { label: "TRY", sub: "AGAIN", color: "#1a1a2e" },
  { label: "5", sub: "CREDITS", color: "#16213e" },
  { label: "100", sub: "POINTS", color: "#1a1a2e" },
  { label: "TRY", sub: "AGAIN", color: "#16213e" },
];

export default function SpinnerPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(23 * 3600 + 45 * 60 + 10);

  // ── Working Timer Logic ──
  useEffect(() => {
    const timerId = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return { h, m, s };
  };
  const { h, m, s } = formatTime(secondsLeft);

  // ── Hardware Accelerated Spin Logic ──
  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    // 5 minimum rotations (1800deg) + random angle
    const randomDegree = Math.floor(Math.random() * 360);
    const totalNewRotation = rotation + 1800 + randomDegree;
    
    setRotation(totalNewRotation);

    // After animation ends (5s)
    setTimeout(async () => {
      setIsSpinning(false);
      const normalizedDegree = (totalNewRotation % 360);
      const stopAngle = (360 - normalizedDegree) % 360;
      const segmentIndex = Math.floor(stopAngle / (360 / SEGMENTS.length));
      const reward = SEGMENTS[segmentIndex];
      alert(`Winner: ${reward.label} ${reward.sub}`);
      
      if (reward.label !== "TRY" && reward.sub !== "OFF") {
        try {
           await studentApi.claimSpinReward({ rewardType: reward.sub, amount: parseInt(reward.label) });
        } catch (e) {
           console.error("Failed to claim spin reward", e);
        }
      }
    }, 5000);
  };

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#050505] px-6 py-12 overflow-hidden text-white">
      
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-cyan-500/10 blur-[100px]" />
      <Star className="absolute top-10 left-10 text-white/10" size={16} />

      <div className="text-center space-y-2 mb-5">
        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase font-serif">VLM Academy</h1>
        <p className="text-[10px] tracking-[0.4em] text-white/40 font-bold uppercase">Learn Without Limits</p>
      </div>

      {/* ── THE WHEEL CONTAINER ── */}
      <div className="relative flex items-center justify-center w-full max-w-[340px] aspect-square">
        
        {/* Fixed Pointer */}
        <div className="absolute -top-4 z-40 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-cyan-400" />
        </div>

        {/* Outer Static Border */}
        <div className="absolute inset-0 rounded-full border-[10px] border-[#1a1a1a] shadow-2xl z-10" />

        {/* Hardware Accelerated Rotating Wheel */}
        <div
          className="relative w-full h-full rounded-full border border-white/5 overflow-hidden transition-transform duration-[5000ms]"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transitionTimingFunction: 'cubic-bezier(0.15, 0, 0.15, 1)', // Smooth stop
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
                <span className="text-[7px] font-bold tracking-widest text-white/30 mt-1 uppercase">{seg.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center Hub */}
        <div className="absolute z-30 h-16 w-16 bg-[#0a0a0a] rounded-full border-[4px] border-[#f5a623] flex items-center justify-center shadow-2xl">
          <ChevronDown className="text-[#f5a623] h-8 w-8" />
        </div>
      </div>

      {/* ── SPIN BUTTON ── */}
      <div className="mt-5 w-full max-w-sm relative">
        <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full" />
        <Button
          onClick={handleSpin}
          disabled={isSpinning}
          className="relative w-full h-16 rounded-full text-lg font-black tracking-widest transition-all active:scale-95 bg-gradient-to-b from-[#2a4e9b] to-[#0a0f1d] border border-cyan-400/40 text-white shadow-xl"
        >
          <div className="flex flex-col">
            <span className="leading-none tracking-[0.1em]">SPIN NOW</span>
            <span className="text-[9px] font-medium opacity-50 tracking-normal mt-1 italic capitalize">Daily free spin!</span>
          </div>
        </Button>
      </div>

      {/* ── TIMER CARD ── */}
      <Card className="mt-2 w-full max-w-[340px] border-white/5 bg-[#111]/60 backdrop-blur-xl rounded-md py-4">
        <CardContent className="flex flex-col items-center space-y-5 p-0">
          <div className="text-center space-y-1">
            <h3 className="text-[11px] font-black tracking-[0.2em] text-white">DAILY REWARDS</h3>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Next free spin in:</p>
          </div>

          <div className="flex items-center gap-3">
             <TimerBox value={h} />
             <span className="text-white/20 font-bold">:</span>
             <TimerBox value={m} />
             <span className="text-white/20 font-bold">:</span>
             <TimerBox value={s} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimerBox({ value }: { value: string }) {
  return (
    <div className="h-10 w-10 rounded-2xl border border-cyan-500/30 bg-black flex items-center justify-center shadow-[inset_0_0_15px_rgba(34,211,238,0.1)]">
      <span className="text-xl font-bold text-white font-mono tabular-nums">{value}</span>
    </div>
  );
}