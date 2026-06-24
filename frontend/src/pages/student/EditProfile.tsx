import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  User,
  BookOpen,
  Globe,
  ChevronLeft,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: (profile as any).fullName ?? "",
        nickname: (profile as any).nickname ?? "",
        class: (profile as any).className ? `Class ${(profile as any).className}th` : "Class 10th",
        city: (profile as any).city ?? "",
      });
    }
  }, [profile]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="relative min-h-svh w-full bg-[#050505] text-white flex flex-col items-center px-6 pt-10 overflow-x-hidden pb-10">
      <div className="max-w-xl w-full">
        <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-cyan-900/10 blur-[100px] pointer-events-none" />

        <header className="relative z-10 w-full flex flex-col items-center gap-6 mb-10">
          <div className="w-full flex items-center justify-start gap-14">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white"
              onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
            >
              <ChevronLeft size={24} />
            </Button>

            <h1>Edit Profile</h1>
          </div>
        </header>

        <div className="relative mb-8 flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-16 w-16 border-[3px] border-cyan-400 p-1 shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-transparent">
              <AvatarImage src="" />
              <AvatarFallback className="bg-black text-white">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-cyan-900 to-black flex items-center justify-center">
                  <User size={32} className="text-white/20" />
                </div>
              </AvatarFallback>
            </Avatar>

            <div className="absolute bottom-1 right-1 bg-cyan-400 rounded-full p-1.5 border-4 border-[#050505] text-black cursor-pointer">
              <Camera size={14} strokeWidth={3} />
            </div>
          </div>

          <div className="text-center mt-4 space-y-1">
            <h2 className="text-white tracking-tight">My Profile</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest">
              Edit Details
            </p>
          </div>
        </div>

        <main className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <EditFieldWrapper icon={<User size={20} />} label="Name">
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="border-none bg-transparent h-auto p-0 text-base text-white focus-visible:ring-0"
            />
          </EditFieldWrapper>

          <EditFieldWrapper icon={<User size={20} />} label="Nickname">
            <Input
              value={formData.nickname}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nickname: e.target.value,
                })
              }
              className="border-none bg-transparent h-auto p-0 text-base text-white focus-visible:ring-0"
            />
          </EditFieldWrapper>

          <EditFieldWrapper icon={<BookOpen size={20} />} label="Class">
            <Select
              value={formData.class}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  class: value ?? "Class 10th",
                })
              }
            >
              <SelectTrigger className="border-none bg-transparent h-auto p-0 text-white">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {CLASSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </EditFieldWrapper>

          <EditFieldWrapper icon={<Globe size={20} />} label="City">
            <Select
              value={formData.city}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  city: value ?? "",
                })
              }
            >
              <SelectTrigger className="border-none bg-transparent h-auto p-0 text-white">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {CITIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </EditFieldWrapper>
        </main>

        <div className="w-full max-w-md space-y-3 mt-6">
          <ProfileLink
            to={PATHS.PLAN_UPGRADE}
            label="Manage Plan"
          />
          <ProfileLink
            to={PATHS.SUBJECT_SELECTION}
            label="Edit Subjects"
          />
          <ProfileLink
            to={PATHS.SESSION_HISTORY}
            label="Session History"
          />
          <ProfileLink
            to={PATHS.REFER_EARN}
            label="Refer & Earn"
          />
        </div>

        <div className="mt-10 w-full max-w-md">
          <Button
            onClick={() => mutation.mutate({
              fullName: formData.name,
              nickname: formData.nickname,
              className: formData.class.replace("Class ", "").replace("th", ""),
              city: formData.city,
            })}
            disabled={mutation.isPending}
            className={cn(
              "w-full h-12 rounded-[2rem]",
              "bg-gradient-to-r from-[#1e3a8e] to-[#0f172a]"
            )}
          >
            {mutation.isPending
              ? "SAVING..."
              : "SAVE CHANGES"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="block w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/80 hover:bg-white/10 transition-colors"
    >
      {label}
    </Link>
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
    <Card className="bg-[#1a1a1a]/80 border-white/5 backdrop-blur-xl rounded-lg overflow-hidden">
      <CardContent className="px-6 flex items-center gap-5">
        <div className="text-white/80">{icon}</div>

        <div className="flex-1 space-y-1">
          <Label className="text-[10px] uppercase tracking-widest text-white/60">
            {label}
          </Label>

          <div className="w-full">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}