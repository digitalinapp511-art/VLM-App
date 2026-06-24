import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Book, Landmark, Calendar, Contact2 } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import QualificationField from "@/components/basic/teacher/QualificationField";
import BEdToggle from "@/components/basic/teacher/BEdToggle";
import CertificateGrid from "@/components/basic/teacher/CertificateGrid";

const TeacherQualificationDetails: React.FC = () => {
  const navigate = useNavigate();
  const [hasBEd, setHasBEd] = useState(true);
  const [form, setForm] = useState({
    highestQualification: "Masters in Education",
    instituteName: "University of London",
    passingYear: "2020",
    teachingCertification: "NET",
  });

  const mutation = useMutation({
    mutationFn: () => teacherApi.updateProfile({ ...form, hasBEd, passingYear: parseInt(form.passingYear) }),
    onSuccess: () => { toast.success("Qualifications saved"); navigate(PATHS.BASICPROFILE_DETAILS
    ); },
    onError: () => toast.error("Failed to save qualifications"),
  });

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-4", bgCss)}>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Qualification Details
        </h1>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "w-full max-w-xl p-6 rounded-[32px] border border-white/10",
          "bg-[#121212]/95 backdrop-blur-xl shadow-2xl relative"
        )}
      >
        <div className="space-y-5">
          <QualificationField label="Highest Qualification" icon={<Book />} value={form.highestQualification} isSelect onChange={(v: string) => setForm(f => ({ ...f, highestQualification: v }))} />
          <QualificationField label="Institute Name" icon={<Landmark />} value={form.instituteName} onChange={(v: string) => setForm(f => ({ ...f, instituteName: v }))} />
          <QualificationField label="Passing Year" icon={<Calendar />} value={form.passingYear} onChange={(v: string) => setForm(f => ({ ...f, passingYear: v }))} />
          <QualificationField label="Teaching Certification" icon={<Contact2 />} value={form.teachingCertification} isSelect onChange={(v: string) => setForm(f => ({ ...f, teachingCertification: v }))} />
          <div className="pt-2">
            <BEdToggle value={hasBEd} onChange={setHasBEd} />
          </div>
          <CertificateGrid />
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full h-14 rounded-full font-bold bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] border border-blue-400/20 text-white mt-4"
          >
            {mutation.isPending ? "Saving..." : "Save & Continue →"}
          </Button>
        </div>
      </motion.div>

      {/* Decorative Blur Elements */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] -z-10" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-yellow-600/5 blur-[120px] -z-10" />
    </div>
  );
};

export default TeacherQualificationDetails;