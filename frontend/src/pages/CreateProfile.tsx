import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, User, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateProfile } from "@/hooks/use-student";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";


function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/4 backdrop-blur-sm px-5 pt-4 pb-5 space-y-4">
      <p className="text-white/90 text-sm font-semibold tracking-wide">{title}</p>
      {children}
    </div>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function CreateProfileShadcn() {
  const navigate = useNavigate();
  const createProfile = useCreateProfile();

  const [medium, setMedium] = useState("English");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [className, setClassName] = useState("10");
  const [board, setBoard] = useState("CBSE");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [parentMobile, setParentMobile] = useState("");

  // Query to get current logged in user details
  const { data: user } = useQuery({
    queryKey: ["currentUserProfileSetup"],
    queryFn: authApi.getMe,
  });

  // Sync user details to states
  useEffect(() => {
    if (user) {
      if (user.mobile) setMobile(user.mobile);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const [preferredSubjects, setPreferredSubjects] = useState<string[]>(["Mathematics"]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>(["Social Studies"]);

  const allSubjects = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "History", "English", "Geography", "Social Studies",
  ];

  const handleContinue = () => {
    if (!fullName.trim()) return;
    createProfile.mutate(
      {
        fullName,
        nickname,
        class: className,
        board,
        city,
        state,
        medium,
        mobile,
        email,
        parentMobile,
        subjects: preferredSubjects,
        preferredSubjects,
        weakSubjects,
      } as any,
      { onSuccess: () => navigate(PATHS.ONBOARDING_SLIDES) }
    );
  };

  const toggleSubject = (subject: string, type: "preferred" | "weak") => {
    if (type === "preferred") {
      setPreferredSubjects((prev) =>
        prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
      );
    } else {
      setWeakSubjects((prev) =>
        prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
      );
    }
  };

  const inputCls =
    "bg-black/60 border border-white/10 text-white placeholder:text-white/25 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/40";

  return (
    <div className="min-h-svh w-full bg-black text-white flex flex-col items-center pb-32">

      {/* ── Subtle radial glow at top ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="w-full max-w-xl px-5 pt-10 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 mb-5 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-white/70" />
        </button>
        <h1 className="text-[22px] font-bold tracking-tight">Create Your Profile</h1>
        <p className="text-white/40 text-xs leading-relaxed mt-1 max-w-xs">
          Welcome to VLM Academy. Help us personalise your learning experience.
        </p>
      </header>

      {/* ── MAIN ── */}
      <main className="w-full max-w-xl px-5 mt-6 space-y-4">

        {/* 1 · Personal Details */}
        <SectionCard title="Personal Details">
          <Field label="Full Name">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
              <Input
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn(inputCls, "pl-10 border-none bg-black/50")}
              />
            </div>
          </Field>

          <Field label="Nickname / Profile Detail">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
              <Input
                placeholder="What should we call you?"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={cn(inputCls, "pl-10 border-none bg-black/50")}
              />
            </div>
          </Field>
        </SectionCard>

        {/* 2 · Education */}
        <SectionCard title="Education">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class">
              <Select value={className} onValueChange={(v) => setClassName(v ?? "10")}>
                <SelectTrigger className={cn(inputCls, "w-full")}>
                  <SelectValue placeholder="Class 10th" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {["8", "9", "10", "11", "12"].map((c) => (
                    <SelectItem key={c} value={c}>Class {c}th</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Board">
              <Select value={board} onValueChange={(v) => setBoard(v ?? "CBSE")}>
                <SelectTrigger className={cn(inputCls, "w-full")}>
                  <SelectValue placeholder="CBSE" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {["CBSE", "ICSE", "State Board", "IB"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Medium">
            <div className="flex gap-2">
              {["English", "Hindi"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMedium(m)}
                  className={cn(
                    "h-9 px-6 rounded-full text-sm font-semibold transition-all",
                    medium === m
                      ? "bg-cyan-500 text-black shadow-[0_0_16px_rgba(6,182,212,0.45)]"
                      : "bg-white/6 text-white/50 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* 3 · Location & Contact */}
        <SectionCard title="Location & Contact">
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <Field label="City">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <Input
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={cn(inputCls, "pl-10")}
                />
              </div>
            </Field>

            <Field label="State">
              <Select value={state} onValueChange={(v) => setState(v ?? "Maharashtra")}>
                <SelectTrigger className={cn(inputCls, "w-full")}>
                  <SelectValue placeholder="MH" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {[
                    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
                    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
                    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
                    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
                    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
                    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
                    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                  ].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-4 pt-2">
            <Field label="Student Mobile Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <Input
                  type="tel"
                  placeholder="Enter student mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={!!user?.mobile}
                  className={cn(inputCls, "pl-10", !!user?.mobile && "opacity-60 bg-zinc-900 cursor-not-allowed")}
                />
              </div>
            </Field>

            <Field label="Student Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Enter student email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!user?.email}
                  className={cn(inputCls, "pl-10", !!user?.email && "opacity-60 bg-zinc-900 cursor-not-allowed")}
                />
              </div>
            </Field>

            <Field label="Parent Mobile Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <Input
                  type="tel"
                  placeholder="Enter parent mobile number"
                  value={parentMobile}
                  onChange={(e) => setParentMobile(e.target.value)}
                  className={cn(inputCls, "pl-10")}
                />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* 4 · Academic Preferences */}
        <SectionCard title="Your Academic Preferences">

          {/* Preferred Subjects */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
              Preferred Subjects
            </p>
            <div className="flex flex-wrap gap-2">
              {allSubjects.map((subject) => {
                const isSelected = preferredSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject, "preferred")}
                    className={cn(
                      "h-8 px-3.5 rounded-full text-xs font-semibold transition-all border",
                      isSelected
                        ? "bg-cyan-500 text-black border-transparent shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weak Subjects */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
              Weak Subjects
            </p>
            <div className="flex flex-wrap gap-2">
              {allSubjects.map((subject) => {
                const isSelected = weakSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject, "weak")}
                    className={cn(
                      "h-8 px-3.5 rounded-full text-xs font-semibold transition-all border",
                      isSelected
                        ? "bg-purple-500 text-white border-transparent shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                        : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

      </main>

      {/* ── STICKY FOOTER ── */}
      <footer className="fixed bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-50">
        <div className="w-full max-w-xl">
          <Button
            onClick={handleContinue}
            disabled={createProfile.isPending || !fullName.trim()}
            className={cn(
              "w-full h-14 rounded-full text-white text-base font-bold tracking-wide transition-all duration-300",
              "bg-gradient-to-b from-[#1e3a8a] to-[#091050]",
              "border-[1.5px] border-[#3b82f6]",
              "shadow-[0_0_24px_rgba(37,99,235,0.5)]",
              "hover:brightness-125 hover:shadow-[0_0_36px_rgba(37,99,235,0.7)]",
              "active:scale-[0.98] active:brightness-90",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            )}
          >
            {createProfile.isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}