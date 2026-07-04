import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  User,
  BookOpen,
  Globe,
  ChevronLeft,
  Pencil,
  LogOut,
  History,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bgCss } from "@/helper/CssHelper";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useStudentProfile, useUpdateProfile } from "@/hooks/use-student";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { studentApi } from "@/lib/student-api";
import { toast } from "sonner";

const CLASSES = [
  "Class 9th",
  "Class 10th",
  "Class 11th",
  "Class 12th",
];

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Pune",
  "Kolkata",
  "Hyderabad",
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useStudentProfile();
  const mutation = useUpdateProfile();
  const isEditing = true;

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    class: "Class 10th",
    city: "",
    subjects: [] as string[],
    weakSubjects: [] as string[],
    profilePhoto: "",
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    if (profile) {
      const p = (profile as any).data ?? profile;
      setFormData({
        name: p.fullName ?? "",
        nickname: p.nickname ?? "",
        class: (p.class || p.className) ? `Class ${p.class || p.className}th` : "Class 10th",
        city: p.city ?? "",
        subjects: p.subjects ?? [],
        weakSubjects: p.weakSubjects ?? [],
        profilePhoto: p.profilePhoto ?? "",
      });
    }
  };

  useEffect(() => {
    resetForm();
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await studentApi.uploadProfilePhoto(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, profilePhoto: res.url }));
        toast.success("Profile photo uploaded to Cloudinary!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handlePhotoUpload(e as any);
    input.click();
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center px-6 pt-8 overflow-x-hidden pb-32", bgCss)}>
      <div className="max-w-md w-full flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="relative w-full flex items-center justify-between mb-6 z-20">
          <button
            onClick={() => navigate(PATHS.PROFILE)}
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
        </header>

        {/* ── PROFILE AVATAR BLOCK ── */}
        <div className="flex flex-col items-center gap-4 p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md w-full">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full border-4 border-cyan-400 bg-black flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.25)] overflow-hidden">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-cyan-400" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>
            {/* Pencil Button overlay to edit profile photo */}
            <button 
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-cyan-400 text-black flex items-center justify-center border-2 border-black shadow-lg cursor-pointer hover:bg-cyan-300 active:scale-95 transition-all"
            >
              <Pencil size={12} strokeWidth={3} />
            </button>
          </div>

          <div className="text-center mt-2 space-y-0.5">
            <h2 className="text-2xl font-black text-white tracking-tight">My Profile</h2>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mt-1">
              Edit Details
            </p>
          </div>
        </div>

        {/* ── FORM FIELDS CARD ── */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Edit Details
            </h3>
          </div>

          <main className="w-full space-y-4">
            <EditFieldWrapper
              icon={<User size={18} className="text-zinc-500 mr-3" />}
              label="Full Name"
              value={formData.name}
              isEditing={isEditing}
            >
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="border-none bg-transparent h-auto p-0 text-sm text-white focus-visible:ring-0 placeholder:text-white/20 mt-0.5"
                placeholder="Name"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<User size={18} className="text-zinc-500 mr-3" />}
              label="Nickname"
              value={formData.nickname}
              isEditing={isEditing}
            >
              <Input
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nickname: e.target.value,
                  })
                }
                className="border-none bg-transparent h-auto p-0 text-sm text-white focus-visible:ring-0 placeholder:text-white/20 mt-0.5"
                placeholder="Nickname"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<BookOpen size={18} className="text-zinc-500 mr-3" />}
              label="Class"
              value={formData.class}
              isEditing={isEditing}
            >
              <Select
                value={formData.class}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    class: value ?? "Class 10th",
                  })
                }
              >
                <SelectTrigger className="border-none bg-transparent h-auto p-0 text-sm text-white focus:ring-0 flex justify-between w-full mt-0.5 select-none">
                  <SelectValue placeholder="Select current class" />
                </SelectTrigger>

                <SelectContent className="bg-[#111] border-white/10 text-white rounded-2xl">
                  {CLASSES.map((item) => (
                    <SelectItem key={item} value={item} className="focus:bg-white/10 focus:text-white rounded-lg">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<Globe size={18} className="text-zinc-500 mr-3" />}
              label="City"
              value={formData.city}
              isEditing={isEditing}
            >
              <Select
                value={formData.city}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    city: value ?? "",
                  })
                }
              >
                <SelectTrigger className="border-none bg-transparent h-auto p-0 text-sm text-white focus:ring-0 flex justify-between w-full mt-0.5 select-none">
                  <SelectValue placeholder="City city" />
                </SelectTrigger>

                <SelectContent className="bg-[#111] border-white/10 text-white rounded-2xl">
                  {CITIES.map((item) => (
                    <SelectItem key={item} value={item} className="focus:bg-white/10 focus:text-white rounded-lg">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </EditFieldWrapper>
          </main>
        </div>

        {/* ── SUBJECT SECTION CARD ── */}
        <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6 w-full">
          <div className="flex items-center border-b border-white/5 pb-4 px-1">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={16} /> Subjects Info
            </h3>
          </div>

          <div className="space-y-4">
            {/* ── EDIT PREFERRED SUBJECTS NAVIGATION ── */}
            <div 
              onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "preferred" } })}
              className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/45 cursor-pointer hover:bg-black/60 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">Preferred Subjects</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Click to edit preferred subjects</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-white/30 rotate-180" />
            </div>

            {/* ── EDIT WEAK SUBJECTS NAVIGATION ── */}
            <div 
              onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "weak" } })}
              className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/45 cursor-pointer hover:bg-black/60 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-red-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">Weak Subjects</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Click to edit weak subjects</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-white/30 rotate-180" />
            </div>
          </div>
        </div>

        {/* ── SAVE ACTION BUTTON ── */}
        <div className="mt-4 w-full">
          <Button
            onClick={() => mutation.mutate({
              fullName: formData.name,
              nickname: formData.nickname,
              class: formData.class.replace("Class ", "").replace("th", ""),
              city: formData.city,
              subjects: formData.subjects,
              weakSubjects: formData.weakSubjects,
              profilePhoto: formData.profilePhoto,
            }, {
              onSuccess: () => {
                setShowSaveSuccess(true);
                setTimeout(() => {
                  setShowSaveSuccess(false);
                  navigate(PATHS.PROFILE);
                }, 1000);
              }
            })}
            disabled={mutation.isPending}
            className={cn(
              "w-full h-14 rounded-full text-sm font-black tracking-widest shadow-lg transition-all active:scale-[0.98]",
              "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white border border-blue-400/20 shadow-[0_0_25px_rgba(37,99,235,0.25)]"
            )}
          >
            {mutation.isPending ? "SAVING..." : "SAVE CHANGES"}
          </Button>
          
          {showSaveSuccess && (
            <p className="text-center text-xs font-bold text-cyan-400 animate-pulse mt-2">
              ✓ Profile Saved Successfully!
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

function EditFieldWrapper({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isEditing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-2">{label}</label>
      <div className="flex items-center p-3 rounded-2xl bg-black/40 border border-white/5 text-white">
        {icon}
        <div className="flex-1 min-w-0 ml-1">{children}</div>
      </div>
    </div>
  );
}