/**
 * QuickAccessGrid.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A 5-column icon grid with 10 quick-access tiles matching the mockup.
 * Each tile has a colored circular icon background, label, and navigates to
 * the corresponding page.
 */
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  MessageCircle,
  Video,
  Headphones,
  Bot,
  FileText,
  BookOpen,
  ClipboardList,
  Target,
  Brain,
  Star,
} from "lucide-react";

interface QuickTile {
  label: string;
  icon: React.ReactNode;
  bg: string;
  to: string;
}

export default function QuickAccessGrid() {
  const navigate = useNavigate();

  const tiles: QuickTile[] = [
    {
      label: "Live Doubt",
      icon: <MessageCircle size={22} className="text-green-600" />,
      bg: "bg-green-100",
      to: PATHS.ASK_DOUBT,
    },
    {
      label: "Video Call",
      icon: <Video size={22} className="text-blue-600" />,
      bg: "bg-blue-100",
      to: PATHS.ASK_DOUBT,
    },
    {
      label: "Chat Support",
      icon: <Headphones size={22} className="text-purple-600" />,
      bg: "bg-purple-100",
      to: PATHS.ASK_DOUBT,
    },
    {
      label: "AI Tutor",
      icon: <Bot size={22} className="text-slate-700" />,
      bg: "bg-slate-100",
      to: PATHS.AI_CHAT,
    },
    {
      label: "Notes",
      icon: <FileText size={22} className="text-yellow-600" />,
      bg: "bg-yellow-100",
      to: PATHS.LIBRARY,
    },
    {
      label: "NCERT Solutions",
      icon: <BookOpen size={22} className="text-emerald-600" />,
      bg: "bg-emerald-100",
      to: PATHS.LIBRARY,
    },
    {
      label: "Test Series",
      icon: <ClipboardList size={22} className="text-cyan-600" />,
      bg: "bg-cyan-100",
      to: PATHS.MCQ,
    },
    {
      label: "Mock Tests",
      icon: <Target size={22} className="text-red-600" />,
      bg: "bg-red-100",
      to: PATHS.MCQ,
    },
    {
      label: "Quizzes",
      icon: <Brain size={22} className="text-pink-600" />,
      bg: "bg-pink-100",
      to: PATHS.MCQ,
    },
    {
      label: "Important Qs",
      icon: <Star size={22} className="text-orange-500" />,
      bg: "bg-orange-100",
      to: PATHS.LIBRARY,
    },
  ];

  return (
    <div className="mx-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-800 text-sm">Quick Access</h2>
        <button className="text-xs font-bold text-violet-600">View All</button>
      </div>

      {/* 5-col grid */}
      <div className="grid grid-cols-5 gap-3">
        {tiles.map((tile) => (
          <button
            key={tile.label}
            onClick={() => navigate(tile.to)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div
              className={`h-12 w-12 rounded-2xl ${tile.bg} flex items-center justify-center shadow-sm group-active:scale-90 transition-transform`}
            >
              {tile.icon}
            </div>
            <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
