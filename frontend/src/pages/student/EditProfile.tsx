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

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    class: "Class 10th",
    city: "",
    subjects: [] as string[],
    weakSubjects: [] as string[],
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      const p = (profile as any).data ?? profile;
      setFormData({
        name: p.fullName ?? "",
        nickname: p.nickname ?? "",
        class: (p.class || p.className) ? `Class ${p.class || p.className}th` : "Class 10th",
        city: p.city ?? "",
        subjects: p.subjects ?? [],
        weakSubjects: p.weakSubjects ?? [],
      });
    }
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem("vlm_token");
    sessionStorage.removeItem("vlm_role");
    navigate(PATHS.SPLASH, { replace: true });
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className={cn("relative min-h-svh w-full text-white flex flex-col items-center px-6 pt-8 overflow-x-hidden pb-32", bgCss)}>
      <div className="max-w-md w-full flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="relative w-full flex items-center justify-center mb-6 z-20">
          <h1 className="text-lg font-bold tracking-[0.1em] uppercase">My Profile</h1>
        </header>

        {/* ── PROFILE AVATAR BLOCK ── */}
        <div className="relative flex flex-col items-center py-2">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full border-4 border-cyan-400 bg-black flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.25)]">
              <User size={40} className="text-cyan-400" />
            </div>
            {/* Pencil Button overlay to edit profile photo */}
            <button 
              type="button"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-cyan-400 text-black flex items-center justify-center border-2 border-black shadow-lg cursor-pointer hover:bg-cyan-300 active:scale-95 transition-all"
            >
              <Pencil size={12} strokeWidth={3} />
            </button>
          </div>

          <div className="text-center mt-4 space-y-0.5">
            <h2 className="text-base font-bold text-white tracking-wide">My Profile</h2>
            <p className="text-[10px] text-white/40 tracking-wider uppercase font-bold">
              Edit Details
            </p>
          </div>
        </div>

        {/* ── FORM FIELDS ── */}
        <main className="w-full space-y-4">
          <EditFieldWrapper icon={<User size={18} className="text-white/60" />} label="Name">
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

          <EditFieldWrapper icon={<User size={18} className="text-white/60" />} label="Nickname">
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

          <EditFieldWrapper icon={<BookOpen size={18} className="text-white/60" />} label="Class">
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

          <EditFieldWrapper icon={<Globe size={18} className="text-white/60" />} label="City">
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

          {/* ── EDIT PREFERRED SUBJECTS NAVIGATION ── */}
          <div 
            onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "preferred" } })}
            className="flex items-center justify-between p-5 rounded-[1.5rem] border border-white/5 bg-white/[0.04] cursor-pointer hover:bg-white/[0.07] transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <BookOpen size={18} className="text-cyan-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Preferred Subjects</span>
                <span className="text-xs text-white/40 block mt-0.5">Click to edit preferred subjects</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-white/30 rotate-180" />
          </div>

          {/* ── EDIT WEAK SUBJECTS NAVIGATION ── */}
          <div 
            onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "weak" } })}
            className="flex items-center justify-between p-5 rounded-[1.5rem] border border-white/5 bg-white/[0.04] cursor-pointer hover:bg-white/[0.07] transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <BookOpen size={18} className="text-red-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Weak Subjects</span>
                <span className="text-xs text-white/40 block mt-0.5">Click to edit weak subjects</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-white/30 rotate-180" />
          </div>

          {/* ── VIEW SESSION HISTORY NAVIGATION ── */}
          <div 
            onClick={() => navigate(PATHS.SESSION_HISTORY)}
            className="flex items-center justify-between p-5 rounded-[1.5rem] border border-white/5 bg-white/[0.04] cursor-pointer hover:bg-white/[0.07] transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <History size={18} className="text-purple-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Session History</span>
                <span className="text-xs text-white/40 block mt-0.5">Click to view past chats and calls</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-white/30 rotate-180" />
          </div>
        </main>

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
            }, {
              onSuccess: () => {
                setShowSaveSuccess(true);
                setTimeout(() => setShowSaveSuccess(false), 3000);
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

        {/* ── LOGOUT BUTTON ── */}
        <div className="w-full">
          <Button
            variant="ghost"
            onClick={() => setShowLogoutModal(true)}
            className="w-full h-12 rounded-full border border-red-500/20 hover:bg-red-500/10 text-red-400 gap-2 font-bold tracking-wide"
          >
            <LogOut size={16} />
            LOG OUT
          </Button>
        </div>

      </div>

      {/* ── LOGOUT CONFIRMATION POPUP ── */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xs rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#1c1c1e] to-[#0a0a0c] p-8 text-center shadow-[0_0_50px_rgba(255,255,255,0.05)] flex flex-col items-center gap-6"
            >
              <div className="h-16 w-16 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400 border border-cyan-500/20 text-2xl shadow-inner">
                ⭐
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white leading-snug">
                  Are you sure you want to log out?
                </h3>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full h-12 rounded-full font-bold text-sm bg-white text-black hover:bg-white/90 border-none transition-all flex items-center justify-center gap-1.5"
                >
                  ✓ CANCEL
                </Button>
                <Button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-full font-bold text-sm bg-gradient-to-b from-blue-700 to-indigo-900 hover:from-blue-600 hover:to-indigo-800 text-white border border-blue-400/20 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  ➜ LOGOUT
                </Button>
              </div>

              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                We priority match your review
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-white/[0.04] border-white/5 backdrop-blur-xl rounded-[1.5rem] overflow-hidden">
      <CardContent className="px-5 py-4 flex items-center gap-4">
        <div className="text-white/50 flex items-center justify-center">{icon}</div>

        <div className="flex-1 min-w-0">
          <Label className="text-[10px] text-white/40 font-bold block mb-0.5">
            {label}
          </Label>
          <div className="w-full">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}