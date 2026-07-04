import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ParentLayout from "@/components/layout/ParentLayout";

export default function ParentAnalytics() {
  const navigate = useNavigate();

  return (
    <ParentLayout>
      <div className="max-w-xl w-full flex flex-col gap-6 pt-2 pb-6">
        {/* Header */}
        <header className="relative w-full flex items-center justify-center z-20">
          <div className="text-center">
            <span style={{ fontFamily: 'Cinzel, serif' }} className="text-xs font-bold text-[#D4AF37] tracking-[0.3em] uppercase block">
              VLM ACADEMY
            </span>
            <h1 className="text-base font-bold text-white tracking-wide mt-1">
              Performance Analytics
            </h1>
          </div>
        </header>

        {/* ── CARD 1: OVERALL PROGRESS TREND ── */}
        <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full flex flex-col items-center">
          <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase mb-5 self-start pl-2">
            OVERALL PROGRESS TREND (LAST 4 WEEKS)
          </span>

          {/* SVG Line Graph with Area Gradient */}
          <div className="w-full relative h-[140px]">
            <svg viewBox="0 0 360 140" className="w-full h-full">
              <defs>
                <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="330" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="65" x2="330" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="110" x2="330" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="24" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">100</text>
              <text x="20" y="69" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">50</text>
              <text x="25" y="114" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">0</text>

              {/* X Axis Labels */}
              <text x="68" y="130" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold" textAnchor="middle">W1</text>
              <text x="150" y="130" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold" textAnchor="middle">W2</text>
              <text x="232" y="130" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold" textAnchor="middle">W3</text>
              <text x="314" y="130" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold" textAnchor="middle">W4</text>

              {/* Area Fill */}
              <path
                d="M 68 95 L 150 68 L 232 78 L 314 45 L 314 110 L 68 110 Z"
                fill="url(#cyanAreaGrad)"
              />

              {/* Cyan Solid Trend Line */}
              <path
                d="M 68 95 L 150 68 L 232 78 L 314 45"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Trend line nodes */}
              <circle cx="68" cy="95" r="4.5" fill="#fff" stroke="#22d3ee" strokeWidth="2.5" />
              <circle cx="150" cy="68" r="4.5" fill="#fff" stroke="#22d3ee" strokeWidth="2.5" />
              <circle cx="232" cy="78" r="4.5" fill="#fff" stroke="#22d3ee" strokeWidth="2.5" />
              <circle cx="314" cy="45" r="4.5" fill="#fff" stroke="#22d3ee" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* ── CARD 2: SUBJECT-WISE PERFORMANCE ── */}
        <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full flex flex-col items-center">
          <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase mb-5 self-start pl-2">
            SUBJECT-WISE PERFORMANCE
          </span>

          {/* SVG Double Bar Chart */}
          <div className="w-full relative h-[140px] px-1">
            <svg viewBox="0 0 360 140" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="340" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="70" x2="340" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="120" x2="340" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="24" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">100</text>
              <text x="20" y="74" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">50</text>
              <text x="25" y="124" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="bold">0</text>

              {/* X Labels (Subject Names) */}
              <text x="75" y="134" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="bold" textAnchor="middle">Mathematics</text>
              <text x="135" y="134" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="bold" textAnchor="middle">Physics</text>
              <text x="195" y="134" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="bold" textAnchor="middle">Chemistry</text>
              <text x="255" y="134" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="bold" textAnchor="middle">Biology</text>
              <text x="315" y="134" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="bold" textAnchor="middle">Computer Sc.</text>

              {/* Mathematics Bars */}
              <rect x="66" y="42" width="7" height="78" rx="2" fill="#22d3ee" />
              <rect x="76" y="60" width="7" height="60" rx="2" fill="#fbbf24" />

              {/* Physics Bars */}
              <rect x="126" y="60" width="7" height="60" rx="2" fill="#22d3ee" />
              <rect x="136" y="52" width="7" height="68" rx="2" fill="#fbbf24" />

              {/* Chemistry Bars */}
              <rect x="186" y="55" width="7" height="65" rx="2" fill="#22d3ee" />
              <rect x="196" y="70" width="7" height="50" rx="2" fill="#fbbf24" />

              {/* Biology Bars */}
              <rect x="246" y="32" width="7" height="88" rx="2" fill="#22d3ee" />
              <rect x="256" y="65" width="7" height="55" rx="2" fill="#fbbf24" />

              {/* Computer Sc Bars */}
              <rect x="306" y="70" width="7" height="50" rx="2" fill="#22d3ee" />
              <rect x="316" y="60" width="7" height="60" rx="2" fill="#fbbf24" />
            </svg>
          </div>

          {/* Legends */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] font-bold text-white/50">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
              <span className="text-[10px] font-bold text-white/50">Class Average</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM GRID: 3 COLUMNS ── */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* MCQ Accuracy */}
          <div className="p-4 rounded-[24px] border border-cyan-500/10 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-between h-[150px] text-center">
            <span className="text-[8px] font-black text-zinc-400 tracking-wider uppercase">MCQ Accuracy</span>
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="3.5"
                  strokeDasharray="163"
                  strokeDashoffset="20"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-black text-white">88%</span>
            </div>
            <div />
          </div>

          {/* Weak Topics */}
          <div className="p-4 rounded-[24px] border border-amber-500/10 bg-white/[0.02] backdrop-blur-md flex flex-col justify-between h-[150px] relative text-left">
            <span className="text-[8px] font-black text-zinc-400 tracking-wider uppercase">Weak Topics</span>
            <div className="space-y-1.5 mt-2">
              <p className="text-[9px] font-bold text-white/80 leading-tight truncate">Quadratic Equations</p>
              <p className="text-[9px] font-bold text-white/80 leading-tight truncate">Optics: Lenses</p>
              <p className="text-[9px] font-bold text-white/80 leading-tight truncate">Cell Division: Mitosis</p>
            </div>
            <div className="self-end text-amber-500/80">
              <AlertTriangle size={14} />
            </div>
          </div>

          {/* Study Hours */}
          <div className="p-4 rounded-[24px] border border-purple-500/10 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-between h-[150px] text-center relative overflow-hidden">
            <span className="text-[8px] font-black text-zinc-400 tracking-wider uppercase z-10">Study Hours</span>
            <div className="flex flex-col items-center justify-center z-10 my-auto">
              <span className="text-[8px] font-bold text-white/40 block leading-none mb-1">(THIS WEEK)</span>
              <span className="text-xl font-black text-purple-400 block leading-tight">28.5</span>
              <span className="text-[10px] font-bold text-purple-300 block leading-none mt-0.5">HRS</span>
            </div>
            <div className="absolute -bottom-4 -right-2 text-purple-500/5 scale-[2] pointer-events-none font-mono font-black select-none">
              $
            </div>
            <div />
          </div>
        </div>

        {/* ── ACTION BUTTON: DOWNLOAD REPORT ── */}
        <div className="mt-2 w-full">
          <Button
            className={cn(
              "w-full h-14 rounded-full text-xs font-black tracking-widest transition-all active:scale-[0.98]",
              "bg-gradient-to-r from-blue-900 to-indigo-950 text-white border border-blue-500/30 hover:border-blue-400/50 shadow-lg"
            )}
          >
            DOWNLOAD REPORT
          </Button>
        </div>

      </div>
    </ParentLayout>
  );
}
