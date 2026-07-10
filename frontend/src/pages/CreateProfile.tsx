import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, User, MapPin, Phone, Mail, Camera, Upload, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateProfile } from "@/hooks/use-student";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { studentApi } from "@/lib/student-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface DropdownProps {
  placeholder: string;
  value: string;
  options: string[] | { label: string; value: string }[];
  onChange: (val: string) => void;
}

function CustomDropdown({ placeholder, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear query on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const displayLabel = typeof options[0] === "object"
    ? (options as { label: string; value: string }[]).find(o => o.value === value)?.label || placeholder
    : value || placeholder;

  const isPlaceholder = !value;

  const filteredOptions = options.filter((opt) => {
    const label = typeof opt === "object" ? opt.label : opt;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={cn("relative w-full", open ? "z-50" : "z-0")} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full h-12 px-4 rounded-xl flex items-center justify-between text-left transition-all border outline-none cursor-pointer box-border",
          "bg-slate-50 dark:bg-black/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
        )}
      >
        <span className={cn("text-sm truncate", isPlaceholder ? "text-slate-400 dark:text-white/25" : "text-slate-850 dark:text-white font-medium")}>
          {displayLabel}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 dark:text-white/40 transition-transform shrink-0 ml-2", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-[999] rounded-2xl bg-white dark:bg-[#161233] border border-slate-200 dark:border-violet-950 shadow-xl py-1 overflow-hidden flex flex-col">
          {/* Search Input Box */}
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-white/5">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:border-violet-500/50"
            />
          </div>

          {/* List Options limited to ~4 items height (4 * 40px = 160px) */}
          <div className="max-h-[160px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-400 dark:text-white/30 text-center">No matches found</p>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = typeof opt === "object" ? opt.value : opt;
                const optLbl = typeof opt === "object" ? opt.label : opt;
                const isSel = optVal === value;
                return (
                  <button
                    key={optVal}
                    type="button"
                    onClick={() => {
                      onChange(optVal);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer block",
                      isSel ? "text-violet-600 dark:text-violet-400 font-extrabold bg-slate-50 dark:bg-white/[0.02]" : "text-slate-700 dark:text-slate-350"
                    )}
                  >
                    {optLbl}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-slate-200/60 dark:border-white/8 bg-white/80 dark:bg-white/4 backdrop-blur-sm px-5 pt-4 pb-5 space-y-4 shadow-sm dark:shadow-md relative", className)}>
      <p className="text-slate-800 dark:text-white/90 text-sm font-black tracking-wide">{title}</p>
      {children}
    </div>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-bold">
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
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [nickname, setNickname] = useState("");
  const [className, setClassName] = useState("10");
  const [board, setBoard] = useState("CBSE");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [parentMobile, setParentMobile] = useState("");

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const res = await studentApi.uploadProfilePhoto(file);
      if (res?.success) {
        setProfilePhoto(res.url);
      }
    } catch (err) {
      console.error("Failed to upload profile photo:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

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
    if (!firstName.trim()) return;
    createProfile.mutate(
      {
        firstName,
        middleName,
        lastName,
        gender,
        dateOfBirth,
        profilePhoto,
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
    "bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-violet-500/50 dark:focus-visible:ring-blue-500/60";

  return (
    <div className="min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center pb-32 transition-colors duration-300">

      {/* ── Subtle radial glow at top ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/5 dark:bg-blue-600/10 blur-[120px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="w-full max-w-xl px-5 pt-10 pb-2">
        <h1 className="text-[22px] font-black tracking-tight text-slate-800 dark:text-white">Create Your Profile</h1>
        <p className="text-slate-500 dark:text-white/40 text-xs leading-relaxed mt-1 max-w-xs font-bold">
          Welcome to VLM Academy. Help us personalise your learning experience.
        </p>
      </header>

      {/* ── MAIN ── */}
      <main className="w-full max-w-xl px-5 mt-6 space-y-4">

        {/* 1 · Personal Details */}
        <SectionCard title="Personal Details" className="z-30">
          {/* Profile Photo Uploader */}
          <div className="flex flex-col items-center gap-3 pb-2 pt-1">
            <div className="relative">
              <div className="relative w-20 h-20 rounded-full border-2 border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-black/60 flex items-center justify-center group">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-400 dark:text-white/25" />
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="h-4 w-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              {/* Circular edit icon badge on bottom-right */}
              <label className="absolute bottom-0 right-0 h-6 w-6 bg-violet-600 dark:bg-violet-500 hover:brightness-110 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#0b081e] shadow-md cursor-pointer transition-all duration-200">
                <Camera className="h-3 w-3 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-widest font-black">Profile Photo (Optional)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="First Name *">
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={cn(inputCls)}
              />
            </Field>

            <Field label="Middle Name">
              <Input
                placeholder="Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className={cn(inputCls)}
              />
            </Field>

            <Field label="Last Name">
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={cn(inputCls)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender *">
              <CustomDropdown
                placeholder="Select Gender"
                value={gender}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" }
                ]}
                onChange={(val) => setGender(val)}
              />
            </Field>

            <Field label="Date of Birth *">
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={cn(inputCls, "text-slate-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark]")}
              />
            </Field>
          </div>

          <Field label="Nickname">
            <Input
              placeholder="What should we call you?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={cn(inputCls)}
            />
          </Field>
        </SectionCard>

        {/* 2 · Education */}
        <SectionCard title="Education" className="z-20">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class">
              <CustomDropdown
                placeholder="Class 10th"
                value={className}
                options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(c => ({
                  label: c === "1" ? "Class 1st" : c === "2" ? "Class 2nd" : c === "3" ? "Class 3rd" : `Class ${c}th`,
                  value: c
                }))}
                onChange={(val) => setClassName(val)}
              />
            </Field>

            <Field label="Board">
              <CustomDropdown
                placeholder="CBSE"
                value={board}
                options={["CBSE", "ICSE", "State Board", "IB"]}
                onChange={(val) => setBoard(val)}
              />
            </Field>
          </div>

          <Field label="Medium">
            <div className="flex gap-2">
              {["English", "Hindi"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMedium(m)}
                  className={cn(
                    "h-9 px-6 rounded-full text-sm font-semibold transition-all border cursor-pointer",
                    medium === m
                      ? "bg-violet-600 dark:bg-violet-500 text-white border-transparent shadow-md shadow-violet-500/15"
                      : "bg-slate-100 dark:bg-white/5 text-slate-650 dark:text-white/50 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* 3 · Location & Contact */}
        <SectionCard title="Location & Contact" className="z-10">
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <Field label="City">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/25 pointer-events-none" />
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={cn(inputCls, "pl-10")}
                />
              </div>
            </Field>

            <Field label="State">
              <CustomDropdown
                placeholder="Select State"
                value={state}
                options={[
                  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
                  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
                  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
                  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
                  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
                  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
                  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                ]}
                onChange={(val) => setState(val)}
              />
            </Field>
          </div>

          <div className="space-y-4 pt-2">
            <Field label="Student Mobile Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/25 pointer-events-none" />
                <Input
                  type="tel"
                  placeholder="Enter student mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={!!user?.mobile}
                  className={cn(inputCls, "pl-10", !!user?.mobile && "opacity-60 bg-slate-100 dark:bg-zinc-900 cursor-not-allowed text-slate-500")}
                />
              </div>
            </Field>

            <Field label="Student Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/25 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Enter student email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!user?.email}
                  className={cn(inputCls, "pl-10", !!user?.email && "opacity-60 bg-slate-100 dark:bg-zinc-900 cursor-not-allowed text-slate-500")}
                />
              </div>
            </Field>

            <Field label="Parent Mobile Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/25 pointer-events-none" />
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
        <SectionCard title="Your Academic Preferences" className="z-0">

          {/* Preferred Subjects */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-bold">
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
                      "h-8 px-3.5 rounded-full text-xs font-semibold transition-all border cursor-pointer",
                      isSelected
                        ? "bg-violet-600 dark:bg-violet-500 text-white border-transparent shadow-md shadow-violet-500/15"
                        : "bg-slate-100 dark:bg-white/5 text-slate-650 dark:text-white/50 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
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
            <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-bold">
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
                      "h-8 px-3.5 rounded-full text-xs font-semibold transition-all border cursor-pointer",
                      isSelected
                        ? "bg-red-500 text-white border-transparent shadow-md shadow-red-500/15"
                        : "bg-slate-100 dark:bg-white/5 text-slate-650 dark:text-white/50 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
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
      <footer className="fixed bottom-0 left-0 w-full p-5 bg-gradient-to-t from-[#f4f6ff] via-[#f4f6ff]/95 to-transparent dark:from-[#0b081e] dark:via-[#0b081e]/95 flex justify-center z-50 transition-colors duration-300">
        <div className="w-full max-w-xl">
          <Button
            onClick={handleContinue}
            disabled={createProfile.isPending || !firstName.trim()}
            className={cn(
              "w-full h-14 rounded-full text-white text-base font-black tracking-wide transition-all duration-300 border-none cursor-pointer",
              "bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600",
              "shadow-md shadow-violet-500/10",
              "active:scale-[0.98]",
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