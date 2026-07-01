import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, PlusSquare, Atom, FlaskConical,
  Sprout, Globe, Map as MapIcon, Book, Monitor,
  Languages, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { studentApi } from "@/lib/student-api";
import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";
import { useStudentProfile, useUpdateProfile } from "@/hooks/use-student";

const FALLBACK_SUBJECTS = [
  { id: "math", name: "Mathematics" },
  { id: "phy", name: "Physics" },
  { id: "chem", name: "Chemistry" },
  { id: "bio", name: "Biology" },
  { id: "his", name: "History" },
  { id: "geo", name: "Geography" },
  { id: "eng", name: "English" },
  { id: "comp", name: "Computer Science" },
  { id: "hin", name: "Hindi" },
];

const getIcon = (id: string) => {
  switch (id) {
    case "math": return PlusSquare;
    case "phy": return Atom;
    case "chem": return FlaskConical;
    case "bio": return Sprout;
    case "his": return Book;
    case "geo": return Globe;
    case "eng": return Book;
    case "comp": return Monitor;
    case "hin": return Languages;
    default: return Book;
  }
};

const fetchSubjects = async () => {
  try {
    const response = await studentApi.getSubjectsFull();
    const subjectsArray = response?.data || response;
    
    if (Array.isArray(subjectsArray) && subjectsArray.length > 0) {
      return subjectsArray.map((s: any) => ({
        id: s.id || s._id,
        label: s.name,
        icon: getIcon(s.id || s._id),
      }));
    }
  } catch (err) {
    console.error("Failed to fetch subjects from backend, using fallbacks.", err);
  }
  return FALLBACK_SUBJECTS.map((s: any) => ({
    id: s.id,
    label: s.name,
    icon: getIcon(s.id),
  }));
};

export default function SubjectSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const fromProfile = location.state?.fromProfile;
  const subjectType = location.state?.type || "preferred"; // "preferred" or "weak"
  
  const role = sessionStorage.getItem("vlm_role");
  const isStudent = role?.toLowerCase() === "student";

  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();
  const updateProfileMutation = useUpdateProfile();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // TanStack Query to fetch subjects
  const { data: subjects, isLoading } = useQuery({
    queryKey: ["availableSubjects"],
    queryFn: fetchSubjects,
  });

  useEffect(() => {
    if (isStudent && subjects && profile && !hasInitialized) {
      const p = (profile as any).data ?? profile;
      // Read weakSubjects or subjects depending on type
      const studentSubjects = subjectType === "weak" ? (p.weakSubjects || []) : (p.subjects || []);
      const initialIds: string[] = [];
      studentSubjects.forEach((subjName: string) => {
        const found = subjects.find(
          (s: any) => s.label.toLowerCase() === subjName.toLowerCase()
        );
        if (found) {
          initialIds.push(found.id);
        }
      });
      if (initialIds.length > 0) {
        setSelectedIds(initialIds);
      }
      setHasInitialized(true);
    }
  }, [isStudent, subjects, profile, hasInitialized, subjectType]);

  // Toggle selection logic
  const toggleSubject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (isLoading) return <LoadingSkeleton />;

  const isWeak = subjectType === "weak";
  const titleText = isWeak ? "Choose Weak Subjects" : "Choose Your Subjects";

  return (
    <div className="relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-5 overflow-x-hidden pb-32">
      {role?.toLowerCase() === 'teacher' && <RegistrationStepper currentStep={4} />}
      
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* ── HEADER ── */}
        <header className="relative z-10 w-full flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={24} />
          </Button>

          <h1 className="text-xl font-bold uppercase tracking-wider">
            {isWeak ? "Weak Subjects" : "Subject Selection"}
          </h1>

          <div className="w-12" />
        </header>

        {/* ── MAIN TITLE ── */}
        <div className="relative z-10 text-center space-y-2 mb-6 mt-4 animate-in fade-in duration-700">
          <span className="font-black text-lg uppercase text-white drop-shadow-sm">
            {titleText}
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
                    ? isWeak
                      ? "border-red-500 bg-red-500/5 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
                      : "border-cyan-400 bg-cyan-500/5 shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                    : "border-white/5 bg-white/[0.03] hover:bg-white/[0.08]"
                )}
              >
                {/* Tick Checkmark Badge */}
                {isSelected && (
                  <div className={cn(
                    "absolute -top-1.5 -right-1.5 z-20 rounded-full h-5 w-5 flex items-center justify-center shadow-lg",
                    isWeak ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  )}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}

                <CardContent className="p-0 flex flex-col items-center gap-3 text-center">
                  <div className={cn(
                    "transition-colors duration-300",
                    isSelected 
                      ? isWeak ? "text-red-500" : "text-cyan-400" 
                      : "text-white/40"
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
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 blur-3xl rounded-full opacity-80 group-hover:opacity-100 transition-opacity",
              isWeak ? "bg-red-600/30" : "bg-blue-600/30"
            )} />

            <Button
              onClick={() => {
                if (role?.toLowerCase() === "student") {
                  const selectedNames = selectedIds.map(id => {
                    const found = subjects?.find((s: any) => s.id === id);
                    return found ? found.label : null;
                  }).filter(Boolean);

                  // Mutate subjects or weakSubjects depending on type
                  const payload = isWeak ? { weakSubjects: selectedNames } : { subjects: selectedNames };

                  updateProfileMutation.mutate(
                    payload,
                    {
                      onSuccess: () => {
                        localStorage.setItem(
                          isWeak ? "vlm_selected_weak_subjects" : "vlm_selected_subjects", 
                          JSON.stringify(selectedIds)
                        );
                        if (fromProfile) {
                          navigate(-1);
                        } else {
                          navigate(PATHS.LEARNING_PLAN);
                        }
                      }
                    }
                  );
                } else {
                  localStorage.setItem("vlm_selected_subjects", JSON.stringify(selectedIds));
                  navigate(PATHS.TEACHERCLASS_SELECTION);
                }
              }}
              disabled={updateProfileMutation.isPending}
              className={cn(
                "relative w-full h-14 rounded-full font-black tracking-widest transition-all active:scale-[0.98] text-white shadow-2xl border",
                isWeak 
                  ? "bg-gradient-to-r from-red-800 to-[#1d0a0f] border-red-500/40"
                  : "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a] border-blue-400/40"
              )}
            >
              {updateProfileMutation.isPending ? "Saving..." : isWeak ? "Save Weak Subjects" : "Save Subjects"}
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
      <div className="w-full flex justify-between">
        <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
        <Skeleton className="h-8 w-40 bg-white/5" />
        <div className="w-12" />
      </div>
      <Skeleton className="h-10 w-64 bg-white/5" />
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-[1.5rem] bg-white/5" />
        ))}
      </div>
    </div>
  );
}