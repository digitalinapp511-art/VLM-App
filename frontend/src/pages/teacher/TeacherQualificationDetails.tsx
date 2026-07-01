import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Book, Landmark, Calendar, Contact2 } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import QualificationField from "@/components/basic/teacher/QualificationField";
import BEdToggle from "@/components/basic/teacher/BEdToggle";
import CertificateGrid from "@/components/basic/teacher/CertificateGrid";

import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";

const highestQualificationOptions = [
  "Bachelors (B.Sc, B.A, B.Com)",
  "Masters (M.Sc, M.A, M.Com)",
  "B.Ed (Bachelor of Education)",
  "M.Ed (Master of Education)",
  "PhD / Doctorate",
  "Diploma in Education (D.El.Ed)",
  "Engineering Degree (B.Tech, M.Tech)",
  "Other Higher Degree"
];

const teachingCertificationOptions = [
  "NET (National Eligibility Test)",
  "SET / SLET (State Eligibility Test)",
  "CTET (Central Teacher Eligibility Test)",
  "State TET (Teacher Eligibility Test)",
  "Trained Graduate Teacher (TGT)",
  "Post Graduate Teacher (PGT)",
  "Primary Teacher (PRT)",
  "None / Not Certified"
];

const TeacherQualificationDetails: React.FC = () => {
  const navigate = useNavigate();
  const [hasBEd, setHasBEd] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    highestQualification: highestQualificationOptions[0],
    instituteName: "",
    passingYear: "",
    teachingCertification: teachingCertificationOptions[0],
  });

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    if (profile && profile.qualification) {
      const q = profile.qualification;
      setForm({
        highestQualification: q.highestQualification || highestQualificationOptions[0],
        instituteName: q.instituteName || "",
        passingYear: q.passingYear ? String(q.passingYear) : "",
        teachingCertification: q.teachingCertification || teachingCertificationOptions[0],
      });
      if (q.hasBEd !== undefined) {
        setHasBEd(q.hasBEd);
      }
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return teacherApi.updateProfile({ qualification: payload });
    },
    onSuccess: () => {
      toast.success("Qualification details saved!");
      navigate(PATHS.EXPERIENCE_DETAILS);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to save details");
    }
  });

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!form.highestQualification) newErrors.highestQualification = "Highest Qualification is required";
    if (!form.instituteName.trim()) newErrors.instituteName = "Institute Name is required";
    if (!form.passingYear.trim()) newErrors.passingYear = "Passing Year is required";
    if (!form.teachingCertification) newErrors.teachingCertification = "Teaching Certification is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    saveMutation.mutate({
      highestQualification: form.highestQualification,
      instituteName: form.instituteName,
      passingYear: Number(form.passingYear),
      teachingCertification: form.teachingCertification,
      hasBEd: hasBEd
    });
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center pb-12", bgCss)}>
      <RegistrationStepper currentStep={2} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-xl p-6 rounded-[32px] border border-white/10 mx-4",
          "bg-[#121212]/95 backdrop-blur-xl shadow-2xl relative"
        )}
      >
        <div className="space-y-5">
          <QualificationField 
            label="Highest Qualification" 
            icon={<Book />} 
            value={form.highestQualification} 
            isSelect 
            options={highestQualificationOptions}
            required
            error={errors.highestQualification}
            onChange={(v: string) => setForm(f => ({ ...f, highestQualification: v }))} 
          />
          <QualificationField 
            label="Institute Name" 
            icon={<Landmark />} 
            value={form.instituteName} 
            placeholder="Enter university or college name..."
            required
            error={errors.instituteName}
            onChange={(v: string) => setForm(f => ({ ...f, instituteName: v }))} 
          />
          <QualificationField 
            label="Passing Year" 
            icon={<Calendar />} 
            value={form.passingYear} 
            placeholder="e.g. 2021"
            required
            error={errors.passingYear}
            onChange={(v: string) => setForm(f => ({ ...f, passingYear: v }))} 
          />
          <QualificationField 
            label="Teaching Certification" 
            icon={<Contact2 />} 
            value={form.teachingCertification} 
            isSelect 
            options={teachingCertificationOptions}
            required
            error={errors.teachingCertification}
            onChange={(v: string) => setForm(f => ({ ...f, teachingCertification: v }))} 
          />
          <div className="pt-2">
            <BEdToggle value={hasBEd} onChange={setHasBEd} />
          </div>
          <CertificateGrid />
          <Button
            onClick={handleContinue}
            disabled={saveMutation.isPending}
            className="w-full h-14 rounded-full font-bold bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] border border-blue-400/20 text-white mt-4"
          >
            {saveMutation.isPending ? "Saving..." : "Save & Continue →"}
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