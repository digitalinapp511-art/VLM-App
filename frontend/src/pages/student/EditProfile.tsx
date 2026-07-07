import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  User,
  BookOpen,
  Globe,
  ChevronLeft,
  Pencil,
  RefreshCw,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn & UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        toast.success("Profile photo uploaded successfully!");
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
    <div className="relative min-h-svh w-full bg-[#f4f6ff] text-slate-800 flex flex-col items-center px-5 pt-4 overflow-x-hidden pb-32 font-sans">
      <div className="max-w-md w-full flex flex-col gap-5">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center gap-4 pb-2 border-b border-slate-100 shrink-0">
          <button
            onClick={() => navigate(PATHS.PROFILE)}
            className="h-10 w-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-800 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-sm font-black tracking-tight text-slate-800">Edit Settings</h1>
        </header>

        {/* ── PROFILE AVATAR BLOCK ── */}
        <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm w-full">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full border-4 border-violet-400 bg-slate-50 flex items-center justify-center shadow-md overflow-hidden">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={38} className="text-violet-500" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-violet-400 animate-spin" />
                </div>
              )}
            </div>
            {/* Pencil Button overlay to edit profile photo */}
            <button 
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-violet-500 text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:bg-violet-600 active:scale-95 transition-all"
            >
              <Pencil size={12} strokeWidth={3} />
            </button>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">My Profile</h2>
            <p className="text-violet-600 text-xs font-black tracking-wider uppercase">
              Edit Details
            </p>
          </div>
        </div>

        {/* ── FORM FIELDS CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-5 w-full">
          <div className="flex items-center border-b border-slate-100 pb-3 px-0.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <User size={15} className="text-violet-600" /> Edit Details
            </h3>
          </div>

          <main className="w-full space-y-4">
            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
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
                className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5"
                placeholder="Name"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
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
                className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5"
                placeholder="Nickname"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<BookOpen size={16} className="text-violet-600 mr-2.5" />}
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
                <SelectTrigger className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus:ring-0 flex justify-between w-full mt-0.5 select-none">
                  <SelectValue placeholder="Select current class" />
                </SelectTrigger>

                <SelectContent className="bg-white border-slate-100 text-slate-700 rounded-2xl shadow-lg">
                  {CLASSES.map((item) => (
                    <SelectItem key={item} value={item} className="focus:bg-violet-50 focus:text-violet-600 rounded-lg">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<Globe size={16} className="text-violet-600 mr-2.5" />}
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
                <SelectTrigger className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus:ring-0 flex justify-between w-full mt-0.5 select-none">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>

                <SelectContent className="bg-white border-slate-100 text-slate-700 rounded-2xl shadow-lg">
                  {CITIES.map((item) => (
                    <SelectItem key={item} value={item} className="focus:bg-violet-50 focus:text-violet-600 rounded-lg">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </EditFieldWrapper>
          </main>
        </div>



        {/* ── SUBJECT SECTION CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-5 w-full">
          <div className="flex items-center border-b border-slate-100 pb-3 px-0.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <BookOpen size={15} className="text-violet-600" /> Subjects Info
            </h3>
          </div>

          <div className="space-y-3">
            {/* Preferred Subjects */}
            <div 
              onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "preferred" } })}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BookOpen size={16} className="text-violet-600" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-800 block">Preferred Subjects</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Click to edit preferred subjects</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-slate-400 rotate-180" />
            </div>

            {/* Weak Subjects */}
            <div 
              onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "weak" } })}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <BookOpen size={16} className="text-red-500" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-800 block">Weak Subjects</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Click to edit weak subjects</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-slate-400 rotate-180" />
            </div>
          </div>
        </div>

        {/* ── SAVE ACTION BUTTON ── */}
        <div className="mt-2 w-full">
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
                toast.success("Profile changes saved!");
                setTimeout(() => {
                  setShowSaveSuccess(false);
                  navigate(PATHS.PROFILE);
                }, 1000);
              }
            })}
            disabled={mutation.isPending}
            className="w-full h-12 rounded-2xl text-xs font-black tracking-widest bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-500/10 transition-all active:scale-[0.98]"
          >
            {mutation.isPending ? "SAVING..." : "SAVE CHANGES"}
          </Button>
          
          {showSaveSuccess && (
            <p className="text-center text-xs font-black text-violet-600 animate-pulse mt-2.5">
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
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700">
        {icon}
        <div className="flex-1 min-w-0 ml-1">{children}</div>
      </div>
    </div>
  );
}