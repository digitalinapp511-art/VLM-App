/**
 * MiniCards.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Three small cards at the bottom of the dashboard:
 *   1. Daily Goal  – MCQ completed / total from backend
 *   2. Upcoming Test – static placeholder (extend when API is ready)
 *   3. AI Tutor    – shortcut card
 */
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { Trophy, CalendarCheck, Bot } from "lucide-react";

interface MiniCardsProps {
  mcqCompleted: number;
  mcqTotal: number;
}

export default function MiniCards({ mcqCompleted, mcqTotal }: MiniCardsProps) {
  const navigate = useNavigate();
  const goalPercent = mcqTotal > 0 ? Math.round((mcqCompleted / mcqTotal) * 100) : 0;

  return (
    <div className="mx-4 grid grid-cols-3 gap-3">
      {/* ── Daily Goal ── */}
      <Card
        bg="bg-orange-50"
        border="border-orange-100"
        onClick={() => navigate(PATHS.MCQ)}
      >
        <Trophy size={18} className="text-orange-500 mb-1" />
        <p className="text-[10px] font-black text-slate-700 leading-tight">Daily Goal</p>
        <p className="text-[9px] text-slate-500 mt-0.5">
          {mcqCompleted}/{mcqTotal} Completed
        </p>
        {/* Mini progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-orange-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-400 transition-all"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </Card>

      {/* ── Upcoming Test ── */}
      <Card
        bg="bg-cyan-50"
        border="border-cyan-100"
        onClick={() => navigate(PATHS.MCQ)}
      >
        <CalendarCheck size={18} className="text-cyan-600 mb-1" />
        <p className="text-[10px] font-black text-slate-700 leading-tight">Upcoming Test</p>
        <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
          Maths Chapter Test
        </p>
        <p className="text-[8px] text-slate-400 mt-0.5">25 May, 10:00 AM</p>
      </Card>

      {/* ── AI Tutor ── */}
      <Card
        bg="bg-violet-50"
        border="border-violet-100"
        onClick={() => navigate(PATHS.AI_CHAT)}
      >
        <Bot size={18} className="text-violet-600 mb-1" />
        <p className="text-[10px] font-black text-slate-700 leading-tight">AI Tutor</p>
        <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
          Ask anything, Get instant answers
        </p>
      </Card>
    </div>
  );
}

function Card({
  children,
  bg,
  border,
  onClick,
}: {
  children: React.ReactNode;
  bg: string;
  border: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-3 rounded-2xl border ${bg} ${border} text-left active:scale-95 transition-transform w-full`}
    >
      {children}
    </button>
  );
}
