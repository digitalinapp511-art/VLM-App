import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, PlusSquare, Atom, FlaskConical,
  Sprout, Globe, Map as MapIcon, Book, Monitor,
  CheckCircle2, Languages
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { studentApi } from "@/lib/student-api";
import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";

const FALLBACK_SUBJECTS = [
  { id: "math", name: "Mathematics" },
  { id: "phy", name: "Physics" },
  { id: "chem", name: "Chemistry" },
  { id: "bio", name: "Biology" },
  { id: "hist", name: "History" },
  { id: "geo", name: "Geography" },
  { id: "eng", name: "English" },
  { id: "cs", name: "Computer Science" },
  { id: "hin", name: "Hindi" },
];

// Fetch real subjects from backend and map to display format
const fetchSubjects = async () => {
  const iconMap: Record<string, any> = {
    Mathematics: PlusSquare, Physics: Atom, Chemistry: FlaskConical,
    Biology: Sprout, History: Globe, Geography: MapIcon,
    English: Book, "Computer Science": Monitor, Hindi: Languages,
  };

  try {
    const response = await studentApi.getSubjectsFull();
    const subjectsArray = response?.data || response;
    
    if (Array.isArray(subjectsArray) && subjectsArray.length > 0) {
      return subjectsArray.map((s: any) => ({
        id: s.id,
        label: s.name,
        icon: iconMap[s.name] || Book,
      }));
    }
  } catch {}

  return FALLBACK_SUBJECTS.map((s: any) => ({
    id: s.id,
    label: s.name,
    icon: iconMap[s.name] || Book,
  }));
};

export default function SubjectSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfile = location.state?.fromProfile;

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("vlm_selected_subjects");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // TanStack Query to fetch subjects
  const { data: subjects, isLoading } = useQuery({
    queryKey: ["availableSubjects"],
    queryFn: fetchSubjects,
  });
const role=sessionStorage.getItem("vlm_role")
  // Toggle selection logic
  const toggleSubject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (isLoading) return <LoadingSkeleton />;
console.log(role)
  return (
    <div className="relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-5  overflow-x-hidden pb-32">
{role?.toLowerCase()=='teacher'&&<RegistrationStepper currentStep={3}/>}
      
      <div className="max-w-xl w-full flex p-0 flex-col justify-center items-center ">
        {/* ── BACKGROUND DECOR ── */}
        <div className="absolute top-[10%] left-[-15%] h-80 w-80 bg-cyan-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-15%] h-80 w-80 bg-purple-900/10 blur-[120px] pointer-events-none" />

        {/* ── HEADER ── */}
        <header className="relative z-10 flex w-full items-center justify-between mb-5 mt-4">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => {
            if (fromProfile) {
              navigate(-1);
            } else {
              navigate(PATHS.CREATE_PROFILE);
            }
          }}>
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Subject Selection</h1>
          <div className="w-12" />
        </header>

        {/* ── MAIN TITLE ── */}
        <div className="relative z-10 text-center space-y-2 mb-6 mt-4 animate-in fade-in duration-700">
          <span className="font-black text-lg uppercase text-white drop-shadow-sm">
            Choose Your Subjects
          </span>
        </div>

        {/* ── SUBJECTS GRID ── */}
        <main className="relative z-10 w-full max-w-sm grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {subjects?.map((subject: any) => {
            const isSelected = selectedIds.includes(subject.id);
            return (
              <Card
                key={subject.id}
                onClick={() => toggleSubject(subject.id)}
                className={cn(
                  "relative aspect-square cursor-pointer transition-all duration-300 rounded-[1.5rem] border-2 flex items-center justify-center overflow-visible",
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/5 shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                    : "border-white/5 bg-white/[0.03] hover:bg-white/[0.08]"
                )}
              >
                {/* Checkmark Badge */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 z-20 bg-cyan-400 rounded-full p-0.5 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    <CheckCircle2 size={16} className="text-black fill-current" strokeWidth={3} />
                  </div>
                )}

                <CardContent className="p-0 flex flex-col items-center gap-3 text-center">
                  <div className={cn(
                    "transition-colors duration-300",
                    isSelected ? "text-cyan-400" : "text-white/40"
                  )}>
                    <subject.icon size={40} strokeWidth={1.5} />
                  </div>
                  <p className={cn(
                    "text-[11px] font-bold tracking-tight px-2 leading-tight",
                    isSelected ? "text-white" : "text-white/50"
                  )}>
                    {subject.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </main>

        {/* ── FIXED BOTTOM BUTTON ── */}
        <footer className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center items-center z-50">
          <div className="w-full max-w-sm relative group ">
            {/* Blue Outer Glow */}
            <div className="absolute  inset-0 bg-blue-600/30 blur-3xl rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />

            <Button
              onClick={() => {
                localStorage.setItem("vlm_selected_subjects", JSON.stringify(selectedIds));
                if (role?.toLocaleLowerCase() === "student") {
                  if (fromProfile) {
                    navigate(-1);
                  } else {
                    navigate(PATHS.LEARNING_PLAN);
                  }
                } else {
                  navigate(PATHS.TEACHERCLASS_SELECTION);
                }
              }}
              className={cn(
                "relative w-full h-14 rounded-full font-black tracking-widest transition-all active:scale-[0.98]",
                "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white shadow-2xl"
              )}
            >
              Save Subjects
            </Button>
          </div>
        </footer>

      </div>
    </div>
  );
}

// ── Skeleton Loader ──
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-12 bg-black min-h-screen flex flex-col items-center">
      <div className="w-full flex justify-between"><Skeleton className="h-12 w-12 rounded-2xl bg-white/5" /><Skeleton className="h-8 w-40 bg-white/5" /><div className="w-12" /></div>
      <Skeleton className="h-10 w-64 bg-white/5" />
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-[1.5rem] bg-white/5" />
        ))}
      </div>
    </div>
  );
}