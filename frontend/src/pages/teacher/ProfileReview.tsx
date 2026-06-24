import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Atom, Users, Play, Star,
  Home, BookOpen, Wallet, Library, User as UserIcon
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";
import ReviewSectionCard from "@/components/basic/teacher/ReviewSectionCard";

const ProfileReview: React.FC = () => {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  const submitMutation = useMutation({
    mutationFn: teacherApi.submitForVerification,
    onSuccess: () => {
      toast.success("Application submitted for verification!");
      // navigate(PATHS.VERIFICATION_STATUS);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Submission failed";
      toast.error(msg);
    },
  });

  const p = profile;
  const user = p?.user;

  return (
    <div className={cn("min-h-screen flex flex-col p-4 pb-48 relative overflow-x-hidden", bgCss)}>
      {/* Decorative Assets */}
      <div className="absolute top-1/2 -right-4 text-purple-500/20 blur-[1px]">
        <Star size={24} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-10 text-zinc-600/30 blur-[1px]">
        <Star size={12} fill="currentColor" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-center mt-4 mb-10">
        <h1 className="text-xl font-black text-white uppercase tracking-[0.05em]">
          Profile Review & Final Submit
        </h1>
      </header>

      <div className="max-w-xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Profile Details */}
        <ReviewSectionCard title="Profile Details" onEdit={() => navigate(PATHS.BASICPROFILE_DETAILS)} className="row-span-1">
          <div className="flex flex-col items-center text-center space-y-3 mb-2">
            <Avatar className="w-16 h-16 border-2 border-blue-400/20">
              <AvatarImage src={p?.profilePhoto ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${p?.fullName ?? 'teacher'}`} />
              <AvatarFallback>{p?.fullName?.[0] ?? 'T'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-base font-bold text-white">{isLoading ? "Loading..." : p?.fullName ?? "—"}</p>
              <p className="text-[11px] font-medium opacity-80">{user?.email ?? "—"}</p>
              <p className="text-[11px] font-medium opacity-80">{user?.mobile ?? "—"}</p>
              <p className="text-[11px] font-medium opacity-60 leading-tight pt-1">
                {p?.address ? `${p.address}, ${p?.city ?? ""} ${p?.state ?? ""}` : "Address not set"}
              </p>
            </div>
          </div>
        </ReviewSectionCard>

        {/* Qualifications */}
        <ReviewSectionCard title="Qualifications" onEdit={() => navigate(PATHS.QUALIFICATION_DETAILS)}>
          <div className="space-y-2">
            <div>
              <p className="text-zinc-100 font-bold text-[13px]">{p?.highestQualification ?? p?.qualification ?? "—"}</p>
              <p className="text-[11px] opacity-80">Institution: {p?.instituteName ?? "—"}</p>
              <p className="text-[11px] opacity-80">Passing year: {p?.passingYear ?? "—"}</p>
              {p?.hasBEd && <p className="text-[11px] opacity-80">B.Ed</p>}
            </div>
          </div>
        </ReviewSectionCard>

        {/* Subjects */}
        <ReviewSectionCard title="Subjects" onEdit={() => { }}>
          <div className="space-y-2.5 pt-1">
            {(p?.subjects ?? []).length > 0 ? (
              (p.subjects as string[]).map((sub: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-zinc-300">
                  <Atom size={14} className="text-zinc-500" />
                  <span className="text-[12px] font-medium capitalize">{sub}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-zinc-500">No subjects selected</p>
            )}
          </div>
        </ReviewSectionCard>

        {/* Classes */}
        <ReviewSectionCard title="Classes" onEdit={() => navigate(PATHS.TEACHERCLASS_SELECTION)}>
          <div className="space-y-2.5 pt-1">
            {(p?.classes ?? []).length > 0 ? (
              (p.classes as string[]).map((cls: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-zinc-300">
                  <Users size={14} className="text-zinc-500" />
                  <span className="text-[12px] font-medium">Class {cls}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-zinc-500">No classes selected</p>
            )}
          </div>
        </ReviewSectionCard>

        {/* Languages */}
        <ReviewSectionCard title="Languages" onEdit={() => navigate(PATHS.LANGUAGE_SELECTION)}>
          <ul className="list-none space-y-1.5 text-[12px] font-medium text-zinc-300">
            {(p?.languages ?? []).length > 0
              ? (p.languages as string[]).map((l: string, i: number) => <li key={i} className="capitalize">{l}</li>)
              : <li className="text-zinc-500">No languages selected</li>
            }
          </ul>
        </ReviewSectionCard>

        {/* Uploaded Documents */}
        <ReviewSectionCard title="Uploaded Documents" onEdit={() => navigate(PATHS.DOCUMENT_UPLOAD)}>
          <div className="space-y-3">
            {[
              { label: "Aadhaar Card", url: p?.aadhaarUrl },
              { label: "Qualification Cert", url: p?.qualificationDocUrl },
              { label: "Experience Doc", url: p?.experienceDocUrl },
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-zinc-400">
                  {doc.label} —{" "}
                  <span className={doc.url ? "text-emerald-500" : "text-zinc-600"}>
                    {doc.url ? "Uploaded" : "Pending"}
                  </span>
                </p>
                <div className={cn("w-3.5 h-3.5 rounded-[4px]", doc.url ? "bg-yellow-500" : "bg-zinc-600")} />
              </div>
            ))}
          </div>
        </ReviewSectionCard>

        {/* Demo Video — Full Width */}
        <ReviewSectionCard title="Demo Video Status" onEdit={() => navigate(PATHS.TEACHER_DEMO_VIDEO)} className="md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center border border-white/5">
              <Play size={18} fill="currentColor" className="text-zinc-400" />
            </div>
            <p className="text-[12px] font-medium text-zinc-300 leading-tight">
              {p?.demoVideoUrl ? "Demo Video — Uploaded & Preview Available" : "Demo Video — Not uploaded yet"}
            </p>
          </div>
        </ReviewSectionCard>
        {/* Action Footer */}
        <div className="w-full md:col-span-2 mt-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full pointer-events-auto"
          >
             <Button
              onClick={() => (submitMutation.mutate(), navigate(PATHS.INTERVIEW_CONFIRMATION))}
              disabled={submitMutation.isPending}
              className="w-full h-16 rounded-full text-lg font-black tracking-tighter uppercase transition-all flex items-center justify-center gap-3 bg-[#1A2E5D] hover:bg-[#254185] border border-blue-400/20 shadow-2xl text-white group"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit for Verification"}
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-[10px] text-zinc-600 text-center mt-6 px-4 leading-tight font-medium">
              Disclaimer: may not use info, used by peditional typographic in this elements. Sketches may be remixed and in color previewed.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" />
        <NavItem icon={<UserIcon />} label="Profile" active onClick={() => navigate(PATHS.PROFILE_REVIEW)} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default ProfileReview;