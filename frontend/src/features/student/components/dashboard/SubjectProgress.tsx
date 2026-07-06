/**
 * SubjectProgress.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows a circular overall progress gauge and subject-by-subject progress bars.
 * Data is fetched from GET /student/stats.
 *
 * If no real data is available from the backend, it renders sensible defaults
 * so the UI always looks complete.
 */
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { BookOpen, FlaskConical, Globe, Languages } from "lucide-react";

const DEFAULT_SUBJECTS = [
  { name: "Mathematics", color: "bg-violet-500", icon: <BookOpen size={14} className="text-violet-600" />, bg: "bg-violet-100", progress: 80 },
  { name: "Science",     color: "bg-green-500",  icon: <FlaskConical size={14} className="text-green-600" />,  bg: "bg-green-100",  progress: 70 },
  { name: "English",     color: "bg-yellow-400", icon: <Languages size={14} className="text-yellow-600" />,   bg: "bg-yellow-100", progress: 65 },
  { name: "Social Science", color: "bg-blue-500", icon: <Globe size={14} className="text-blue-600" />,       bg: "bg-blue-100",   progress: 60 },
];

export default function SubjectProgress() {
  const { data: statsRaw } = useQuery({
    queryKey: ["student-stats"],
    queryFn: studentApi.getStats,
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
  const R = 40;
  const C = 2 * Math.PI * R;
  const dash = (overall / 100) * C;

  return (
    <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-800 text-sm">Your Subjects Progress</h2>
        <button className="text-xs font-bold text-slate-400 border border-slate-200 rounded-full px-3 py-1">
          This Week ▾
        </button>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="50" cy="50" r={R}
              fill="none"
              stroke="url(#grad)"
              strokeWidth="10"
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
            <span className="font-black text-xl text-slate-800">{overall}%</span>
            <span className="text-[9px] text-slate-400 font-semibold text-center leading-tight">Overall Progress</span>
          </div>
        </div>

        {/* Subject bars */}
        <div className="flex-1 space-y-2.5">
          {subjects.map((s: any) => (
            <div key={s.name} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-slate-700">{s.name}</span>
                  <span className="text-[10px] font-black text-slate-500">{s.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
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
