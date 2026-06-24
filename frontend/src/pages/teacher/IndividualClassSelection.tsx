import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, Users, Calculator, Pencil, Beaker, 
  Presentation, Waves, Globe, MonitorPlay, 
  BookText, Share2, GraduationCap, ChevronRight 
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import IndividualClassCard from "@/components/basic/teacher/IndividualClassCard";

interface ClassData {
  id: number;
  title: string;
  category?: string;
  icon: React.ReactNode;
}

const classesData: ClassData[] = [
  { id: 1, title: "Class 1", category: "Primary", icon: <User /> },
  { id: 2, title: "Class 2", icon: <Users /> },
  { id: 3, title: "Class 3", icon: <Calculator /> },
  { id: 4, title: "Class 4", icon: <Pencil /> },
  { id: 5, title: "Class 5", icon: <Beaker /> },
  { id: 6, title: "Class 6", category: "Middle School", icon: <Presentation /> },
  { id: 7, title: "Class 7", icon: <Waves /> },
  { id: 8, title: "Class 8", icon: <Globe /> },
  { id: 9, title: "Class 9", category: "High School", icon: <MonitorPlay /> },
  { id: 10, title: "Class 10", icon: <BookText /> },
  { id: 11, title: "Class 11", icon: <Share2 /> },
  { id: 12, title: "Class 12", category: "Senior High", icon: <GraduationCap /> },
];

const IndividualClassSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClasses, setSelectedClasses] = useState<number[]>([6, 7, 8, 9, 10]);

  const toggleClass = (id: number) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-32", bgCss)}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-10 text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
          Select Your Classes
        </h1>
        <p className="text-zinc-400 text-sm max-w-[280px] mx-auto leading-tight">
          Choose the individual classes you will teach at VLM Academy.
        </p>
      </motion.header>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 w-full max-w-xl"
      >
        {classesData.map((cls) => (
          <motion.div key={cls.id} variants={itemVariants}>
            <IndividualClassCard
              id={cls.id}
              title={cls.title}
              category={cls.category}
              icon={cls.icon}
              isSelected={selectedClasses.includes(cls.id)}
              onClick={() => toggleClass(cls.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center bg-gradient-to-t from-black/80 to-transparent backdrop-blur-[2px] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl pointer-events-auto"
        >
          <Button
            onClick={() => navigate("/teacher/register/success")}
            className={cn(
              "w-full h-16 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:from-[#355bc0] hover:to-[#233c7a]",
              "border border-white/10 shadow-2xl text-white group"
            )}
          >
            CONTINUE
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ChevronRight size={22} className="opacity-90" />
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Decorative Blur */}
      <div className="fixed bottom-1/4 right-0 w-48 h-48 bg-purple-500/5 blur-[100px] pointer-events-none" />
      <div className="fixed top-1/4 left-0 w-48 h-48 bg-blue-500/5 blur-[100px] pointer-events-none" />
    </div>
  );
};

export default IndividualClassSelection;