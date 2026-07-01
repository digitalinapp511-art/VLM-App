import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Atom,
  Orbit,
  FlaskConical,
  Sprout,
  Book,
  Globe,
  BookText,
  LineChart,
  Monitor,
  Star,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import SubjectCard from "@/components/basic/teacher/SubjectCard";
import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";

interface Subject {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "gold" | "zinc" | "green" | "cyan" | "pink" | "orange" | "rose";
}

const subjects: Subject[] = [
  { id: "maths", label: "Maths", icon: <Calculator />, color: "blue" },
  { id: "science", label: "Science", icon: <Atom />, color: "cyan" },
  { id: "physics", label: "Physics", icon: <Orbit />, color: "purple" },
  { id: "chemistry", label: "Chemistry", icon: <FlaskConical />, color: "gold" },
  { id: "biology", label: "Biology", icon: <Sprout />, color: "green" },
  { id: "english", label: "English", icon: <Book />, color: "pink" },
  { id: "hindi", label: "Hindi", icon: <span className="text-3xl font-bold font-serif leading-none">श्र</span>, color: "orange" },
  { id: "sst", label: "SST", icon: <Globe />, color: "rose" },
  { id: "accounts", label: "Accounts", icon: <BookText />, color: "blue" },
  { id: "economics", label: "Economics", icon: <LineChart />, color: "gold" },
  { id: "computer", label: "Computer", icon: <Monitor />, color: "cyan" },
  { id: "others", label: "Others", icon: <Star />, color: "zinc" },
];

const TeacherSubjectSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    if (profile && profile.subjects) {
      setSelectedIds(profile.subjects);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (subjectsList: string[]) => {
      return teacherApi.updateProfile({ subjects: subjectsList });
    },
    onSuccess: () => {
      toast.success("Subjects saved successfully!");
      navigate(PATHS.TEACHERCLASS_SELECTION);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to save subjects");
    }
  });

  const toggleSubject = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    saveMutation.mutate(selectedIds);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-36", bgCss)}>
      <RegistrationStepper currentStep={4} />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-12 text-center"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Select Your Subjects
        </h1>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-300"
      >
        {subjects.map((subject) => (
          <motion.div key={subject.id} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}>
            <SubjectCard
              {...subject}
              isSelected={selectedIds.includes(subject.id)}
              activeColor={subject.color}
              onClick={() => toggleSubject(subject.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 w-full p-6 flex justify-center bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl pointer-events-auto"
        >
          <Button
            onClick={handleContinue}
            disabled={saveMutation.isPending}
            className={cn(
              "w-full h-16 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-white/10 shadow-2xl text-white group"
            )}
          >
            {saveMutation.isPending ? "SAVING..." : "CONTINUE"}
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ChevronRight size={24} />
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Decorative Glows */}
      <div className="fixed top-10 right-4 text-purple-500/40 blur-sm rotate-45">
        <Star size={24} fill="currentColor" />
      </div>
    </div>
  );
};

export default TeacherSubjectSelection;