import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Globe, MoreHorizontal, Star, ChevronRight } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import LanguageCard from "@/components/basic/teacher/LanguageCard";
import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";

interface Language {
  id: string;
  label: string;
  nativeLabel?: string;
  glyph: React.ReactNode;
}

const languages: Language[] = [
  { id: "hi", label: "Hindi", nativeLabel: "हिंदी", glyph: "हि" },
  { id: "en", label: "English", glyph: <Globe size={32} strokeWidth={1.5} /> },
  { id: "eh", label: "Eng+Hin", glyph: "हिA" },
  { id: "ta", label: "Tamil", nativeLabel: "தமிழ்", glyph: "த" },
  { id: "te", label: "Telugu", nativeLabel: "తెలుగు", glyph: "తె" },
  { id: "bn", label: "Bengali", nativeLabel: "বাংলা", glyph: "বং" },
  { id: "mr", label: "Marathi", nativeLabel: "मराठी", glyph: "मरा" },
  { id: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", glyph: "ਪੰ" },
  { id: "ot", label: "Others", glyph: <MoreHorizontal size={32} /> },
];

const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    if (profile && profile.languages) {
      setSelected(profile.languages);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (langsList: string[]) => {
      return teacherApi.updateProfile({ languages: langsList });
    },
    onSuccess: () => {
      toast.success("Languages saved successfully!");
      navigate(PATHS.DOCUMENT_UPLOAD);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to save languages");
    }
  });

  const toggleLanguage = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one language");
      return;
    }
    saveMutation.mutate(selected);
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-40 relative overflow-hidden", bgCss)}>
      <RegistrationStepper currentStep={7} />
      
      {/* Decorative Star/Glows */}
      <div className="absolute top-16 right-8 text-purple-500/40 blur-[1px]">
        <Star size={24} fill="currentColor" />
      </div>
      <div className="absolute top-1/2 left-4 text-yellow-500/30 blur-[2px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>

      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 mb-12 text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-white tracking-widest uppercase">
          Select Your Teaching Languages
        </h1>
        <p className="text-zinc-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed opacity-80">
          Choose the languages you are comfortable teaching in (multi-select).
        </p>
      </motion.header>

      {/* Language Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
        className="grid grid-cols-3 gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-300"
      >
        {languages.map((lang) => (
          <motion.div 
            key={lang.id} 
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          >
            <LanguageCard
              label={lang.label}
              nativeLabel={lang.nativeLabel}
              glyph={lang.glyph}
              isSelected={selected.includes(lang.id)}
              onClick={() => toggleLanguage(lang.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Section */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex flex-col items-center gap-4 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-sm pointer-events-none">
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
              "border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] text-white group"
            )}
          >
            {saveMutation.isPending ? "SAVING..." : "CONTINUE"}
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ChevronRight size={22} className="opacity-90" />
            </div>
          </Button>
          <p className="text-zinc-500 text-[11px] font-medium text-center mt-4 tracking-wide uppercase">
            Minimum 1 language required.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSelection;