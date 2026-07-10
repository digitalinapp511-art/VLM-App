import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IdCard, GraduationCap, Briefcase, HelpCircle, ChevronRight, Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import DocumentUploadCard from "@/components/basic/teacher/DocumentUploadCard";
import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { url: string; name: string }>>({});
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  useEffect(() => {
    if (profile) {
      const docs: Record<string, { url: string; name: string }> = {};
      
      // Seed from profile.documents if they exist as simple URLs
      if (profile.documents) {
        if (profile.documents.aadhaar) {
          docs.aadhaar = { url: profile.documents.aadhaar, name: "Aadhaar Card" };
        }
        if (profile.documents.qualificationCert) {
          docs.qualificationCert = { url: profile.documents.qualificationCert, name: "Qualification Certificate" };
        }
        if (profile.documents.experienceProof) {
          docs.experienceProof = { url: profile.documents.experienceProof, name: "Experience Document" };
        }
      }

      // Overwrite with actual uploaded Document items to show real file names
      if (profile.uploadedDocuments) {
        profile.uploadedDocuments.forEach((doc: any) => {
          if (["aadhaar", "qualificationCert", "experienceProof"].includes(doc.type)) {
            docs[doc.type] = { url: doc.url, name: doc.name };
          }
        });
      }
      setUploadedDocs(docs);
    }
  }, [profile]);

  const uploadMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const result = await teacherApi.uploadDocument(file, id, file.name);
      return { id, url: result.url, name: file.name };
    },
    onSuccess: ({ id, url, name }) => {
      setUploadedDocs(prev => ({ ...prev, [id]: { url, name } }));
      toast.success(`Document uploaded successfully`);
    },
    onError: () => toast.error("Upload failed. Make sure server is running and Cloudinary config is correct."),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return teacherApi.updateProfile({
        documents: {
          aadhaar: uploadedDocs.aadhaar?.url || "",
          qualificationCert: uploadedDocs.qualificationCert?.url || "",
          experienceProof: uploadedDocs.experienceProof?.url || ""
        },
        applicationStatus: "submitted"
      });
    },
    onSuccess: () => {
      toast.success("Documents submitted successfully!");
      navigate(PATHS.INTERVIEW_SCHEDULE);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to submit documents");
    }
  });

  const handleUpload = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) uploadMutation.mutate({ id, file });
    };
    input.click();
  };

  const handleContinue = () => {
    if (!uploadedDocs.aadhaar?.url) {
      toast.error("Please upload your Aadhaar Card");
      return;
    }
    if (!uploadedDocs.qualificationCert?.url) {
      toast.error("Please upload your Qualification Certificate");
      return;
    }
    if (!uploadedDocs.experienceProof?.url) {
      toast.error("Please upload your Experience Document");
      return;
    }
    submitMutation.mutate();
  };

  const docStatus = (id: string) => uploadedDocs[id]?.url ? "UPLOADED" : "PENDING";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-32 relative overflow-hidden", bgCss)}>
      <RegistrationStepper currentStep={8} />
      
      {/* Decorative Assets */}
      <div className="absolute top-10 right-8 text-purple-500/40 blur-[1px] rotate-12">
        <Star size={24} fill="currentColor" />
      </div>
      <div className="absolute bottom-1/4 right-6 text-zinc-600/40 blur-[1px]">
        <Star size={12} fill="currentColor" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 mb-10 text-center"
      >
        <h1 className="text-[28px] font-bold text-white tracking-widest uppercase">
          Document Upload
        </h1>
      </motion.header>

      {/* Upload Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl space-y-4"
      >
        <DocumentUploadCard
          id="aadhaar"
          title="Aadhaar Card"
          description="Upload Image or PDF (Front & Back)"
          icon={<IdCard />}
          status={docStatus("aadhaar") as any}
          onUpload={handleUpload}
          topRightIcon={<IdCard />}
          required
          fileName={uploadedDocs.aadhaar?.name}
        />

        <DocumentUploadCard
          id="qualificationCert"
          title="Qualification Certificate"
          description="Upload Highest Degree or Marklist"
          icon={<GraduationCap className="text-yellow-500/80" />}
          status={docStatus("qualificationCert") as any}
          onUpload={handleUpload}
          required
          fileName={uploadedDocs.qualificationCert?.name}
        />

        <DocumentUploadCard
          id="experienceProof"
          title="Experience Document"
          description="Upload Work Experience Letter"
          icon={<Briefcase className="text-purple-400" />}
          status={docStatus("experienceProof") as any}
          onUpload={handleUpload}
          required
          fileName={uploadedDocs.experienceProof?.name}
        />
      </motion.div>

      {/* Footer Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:p-8 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent backdrop-blur-[2px] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl flex items-center gap-2 md:gap-4 pointer-events-auto"
        >
          {/* Help Button */}
          <Button
            type="button"
            onClick={() => setShowHelpModal(true)}
            variant="ghost"
            size="icon"
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 bg-zinc-900/40 text-zinc-400 hover:text-white shrink-0 animate-pulse"
          >
            <HelpCircle size={24} strokeWidth={1.5} className="md:w-7 md:h-7" />
          </Button>

          {/* Submit Button */}
          <Button
            onClick={handleContinue}
            disabled={submitMutation.isPending || uploadMutation.isPending}
            className={cn(
              "flex-1 h-14 md:h-16 rounded-full text-[13px] sm:text-sm md:text-lg font-bold transition-all uppercase tracking-tight",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-blue-400/20 shadow-2xl text-white whitespace-nowrap"
            )}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit for Verification"}
          </Button>
        </motion.div>
      </div>

      {/* Guidelines Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-[32px] border border-white/10 bg-zinc-950 text-zinc-100 shadow-2xl relative space-y-4"
          >
            <h3 className="text-xl font-bold text-yellow-500">Upload Guidelines</h3>
            
            <div className="space-y-3 text-sm text-zinc-300">
              <div>
                <h4 className="font-semibold text-zinc-100 mb-0.5">Aadhaar Card</h4>
                <p className="text-xs text-zinc-400">Upload a single clear image or PDF containing both the front and back sides of your Aadhaar card.</p>
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100 mb-0.5">Qualification Certificate</h4>
                <p className="text-xs text-zinc-400">Upload your highest graduation degree certificate, post-graduation degree, or college marklist.</p>
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100 mb-0.5">Experience Document</h4>
                <p className="text-xs text-zinc-400">Upload previous teaching experience letters, school appointment orders, or internship proofs.</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[11px] text-zinc-500">Supported formats: JPG, PNG, PDF. Maximum file size: 10MB per file.</p>
              </div>
            </div>

            <Button 
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full h-11 mt-4 rounded-xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/20 transition-all"
            >
              Got It
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
