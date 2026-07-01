import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Baby, Presentation, Atom, GraduationCap, ChevronRight } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import ClassSelectionCard from "@/components/basic/teacher/ClassSelectionCard";
import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";

interface ClassGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const classGroups: ClassGroup[] = [
  {
    id: "1-5",
    title: "Class 1 to 5",
    subtitle: "Primary Classes (1-5)",
    icon: <Baby size={48} strokeWidth={1} className="text-zinc-200" />,
  },
  {
    id: "6-8",
    title: "Class 6 to 8",
    subtitle: "Middle School Classes (6-8)",
    icon: <Presentation size={48} strokeWidth={1} className="text-zinc-200" />,
  },
  {
    id: "9-10",
    title: "Class 9 to 10",
    subtitle: "High School Classes (9-10)",
    icon: <Atom size={48} strokeWidth={1} className="text-zinc-200" />,
  },
  {
    id: "11-12",
    title: "Class 11 to 12",
    subtitle: "Senior High Classes (11-12)",
    icon: <GraduationCap size={48} strokeWidth={1} className="text-zinc-200" />,
  },
];

const TeacherClassSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    if (profile && profile.classes) {
      setSelectedClasses(profile.classes);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (classesList: string[]) => {
      return teacherApi.updateProfile({ classes: classesList });
    },
    onSuccess: () => {
      toast.success("Classes saved successfully!");
      navigate(PATHS.BOARD_SELECTION);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to save classes");
    }
  });

  const toggleClass = (id: string) => {
    setSelectedClasses(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    if (selectedClasses.length === 0) {
      toast.error("Please select at least one class group");
      return;
    }
    saveMutation.mutate(selectedClasses);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-32", bgCss)}>
      <RegistrationStepper currentStep={5} />
      
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 mb-10 text-center space-y-3"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
          Select Your Classes
        </h1>
        <p className="text-zinc-400 text-[15px] leading-relaxed max-w-xs mx-auto">
          Choose the class groups you will teach at VLM Academy
        </p>
      </motion.header>

      {/* Grid Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-300"
      >
        {classGroups.map((group) => (
          <motion.div key={group.id} variants={itemVariants} className="w-full">
            <ClassSelectionCard
              title={group.title}
              subtitle={group.subtitle}
              icon={group.icon}
              isSelected={selectedClasses.includes(group.id)}
              onClick={() => toggleClass(group.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Continue Button Section */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center bg-gradient-to-t from-black/60 to-transparent backdrop-blur-xs pointer-events-none">
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
              <ChevronRight size={24} className="opacity-90" />
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Decorative Glows */}
      <div className="fixed top-1/4 -left-10 w-32 h-32 bg-yellow-500/5 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-10 w-32 h-32 bg-blue-500/5 blur-[100px] pointer-events-none" />
    </div>
  );
};

export default TeacherClassSelection;