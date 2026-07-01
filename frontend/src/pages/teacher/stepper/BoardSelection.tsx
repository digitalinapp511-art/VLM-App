import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { School, BookOpenCheck, ChevronRight, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import BoardSelectionCard from "@/components/basic/teacher/BoardSelectionCard";
import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";

interface TeachingBoard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const teachingBoards: TeachingBoard[] = [
  {
    id: "cbse",
    title: "CBSE",
    description: "Central Board of Secondary Education",
    icon: <School />,
  },
  {
    id: "state",
    title: "STATE BOARD",
    description: "Localized State Educational Board",
    icon: <BookOpenCheck />,
  },
];

const BoardSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    if (profile && profile.boards) {
      setSelectedBoards(profile.boards);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (boardsList: string[]) => {
      return teacherApi.updateProfile({ boards: boardsList });
    },
    onSuccess: () => {
      toast.success("Boards saved successfully!");
      navigate(PATHS.LANGUAGE_SELECTION);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to save boards");
    }
  });

  const toggleBoard = (id: string) => {
    setSelectedBoards(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    if (selectedBoards.length === 0) {
      toast.error("Please select at least one teaching board");
      return;
    }
    saveMutation.mutate(selectedBoards);
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-32 relative overflow-hidden", bgCss)}>
      <RegistrationStepper currentStep={6} />
      
      {/* Decorative Stars & Glows */}
      <div className="absolute top-20 right-10 text-purple-500/40 blur-[1px]">
        <Star size={24} fill="currentColor" />
      </div>
      <div className="absolute bottom-1/3 right-10 text-zinc-600/40 blur-[1px]">
        <Star size={12} fill="currentColor" />
      </div>
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 mb-14 text-center space-y-4"
      >
        <h1 className="text-[28px] font-bold text-white tracking-widest uppercase">
          Select Your Teaching Boards
        </h1>
        <p className="text-zinc-400 text-base font-medium max-w-sm mx-auto leading-relaxed">
          Choose the educational boards you will teach at VLM Academy
        </p>
      </motion.header>

      {/* Cards Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl px-2 animate-in fade-in zoom-in-95 duration-300"
      >
        {teachingBoards.map((board) => (
          <BoardSelectionCard
            key={board.id}
            title={board.title}
            description={board.description}
            icon={board.icon}
            isSelected={selectedBoards.includes(board.id)}
            onClick={() => toggleBoard(board.id)}
          />
        ))}
      </motion.div>

      {/* Continue Button Section */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm pointer-events-auto"
        >
          <Button
            onClick={handleContinue}
            disabled={saveMutation.isPending}
            className={cn(
              "w-full h-16 rounded-full text-xl font-bold transition-all flex items-center justify-center gap-4",
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
    </div>
  );
};

export default BoardSelection;