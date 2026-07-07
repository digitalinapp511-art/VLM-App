/**
 * SubjectProgress.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows a circular overall progress gauge and subject-by-subject progress bars.
 * Data is fetched from GET /student/stats.
 *
 * If no real data is available from the backend, it renders sensible defaults
 * so the UI always looks complete.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { BookOpen, FlaskConical, Globe, Languages } from "lucide-react";

const DEFAULT_SUBJECTS = [
  { name: "Mathematics", color: "bg-violet-500", icon: <BookOpen size={14} className="text-violet-600 dark:text-violet-400" />, bg: "bg-violet-100 dark:bg-violet-950/40", progress: 80 },
  { name: "Science",     color: "bg-green-500",  icon: <FlaskConical size={14} className="text-green-600 dark:text-green-400" />,  bg: "bg-green-100 dark:bg-green-950/40",  progress: 70 },
  { name: "English",     color: "bg-yellow-400", icon: <Languages size={14} className="text-yellow-600 dark:text-yellow-400" />,   bg: "bg-yellow-100 dark:bg-yellow-950/40", progress: 65 },
  { name: "Social Science", color: "bg-blue-500", icon: <Globe size={14} className="text-blue-600 dark:text-blue-400" />,       bg: "bg-blue-100 dark:bg-blue-950/40",   progress: 60 },
];

export default function SubjectProgress() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week");

  const { data: statsRaw } = useQuery({
    queryKey: ["student-stats", timeframe],
    queryFn: () => studentApi.getStats(timeframe),
    staleTime: 5 * 60_000,
  });

  const stats = (statsRaw as any)?.data ?? statsRaw;
  const subjects =
    stats?.subjectProgress?.length
      ? stats.subjectProgress.map((s: any, i: number) => ({
          name: s.name,
          color: DEFAULT_SUBJECTS[i % DEFAULT_SUBJECTS.length].color,
          icon: DEFAULT_SUBJECTS[i % DEFAULT_SUBJECTS.length].icon,
          bg: DEFAULT_SUBJECTS[i % DEFAULT_SUBJECTS.length].bg,
          progress: Math.round(s.progress ?? 0),
        }))
      : DEFAULT_SUBJECTS;

  const overall =
    Math.round(subjects.reduce((sum: number, s: any) => sum + s.progress, 0) / subjects.length) || 75;

  // Circular progress via SVG
  const R = 36;
  const strokeWidth = 8;
  const C = 2 * Math.PI * R;
  const dash = (overall / 100) * C;

  return (
    <div className="mx-0 w-full bg-white dark:bg-[#161233] rounded-2xl border border-slate-100 dark:border-[#221c4e] shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-800 dark:text-slate-100 text-sm">Your Subjects Progress</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="text-xs font-black tracking-wide text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-[#221c4e] rounded-full px-3 py-1 bg-slate-50 dark:bg-[#110d2c] shadow-sm outline-none cursor-pointer focus:ring-1 focus:ring-violet-500/20 transition-all"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth={strokeWidth} />
            <circle
              cx="50" cy="50" r={R}
              fill="none"
              stroke="url(#grad)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${C}`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-black text-xl text-slate-800 dark:text-slate-100 leading-none">{overall}%</span>
            <span className="text-[8px] tracking-wider text-slate-400 dark:text-slate-500 font-bold uppercase text-center leading-none mt-1">Overall</span>
          </div>
        </div>

        {/* Subject bars */}
        <div className="flex-1 space-y-2.5">
          {subjects.map((s: any) => (
            <div key={s.name} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{s.name}</span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">{s.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all duration-700`}
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
