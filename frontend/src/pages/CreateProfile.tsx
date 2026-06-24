import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateProfile } from "@/hooks/use-student";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BackgroundElement } from "@/components/basic/BackgroundElements";

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

  // ── State for Selections ────────────────────────────────
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>(["Physics"]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>(["Social Studies"]);

  const allSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "English", "Geography", "Social Studies"];

  const handleContinue = () => {
    if (!fullName.trim()) return;
    createProfile.mutate(
      { fullName, nickname, className, board, city, state },
      { onSuccess: () => navigate(PATHS.SUBJECT_SELECTION) }
    );
  };

  // ── Toggle Logic ────────────────────────────────────────
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

  return (
    <div className="vlm-bg-navy min-h-svh w-full bg-black text-white flex flex-col items-center pb-2">
      {/* HEADER */}
      <header className="w-full max-w-xl px-6 pt-8 space-y-4">
        <Button variant="ghost" size="icon" className="text-white -ml-2" onClick={() => navigate(PATHS.OTP)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl tracking-tight">Create Your Profile</h1>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
            VLM Academy Onboarding Welcome to the VLM, advanced student learning platform.
          </p>
        </div>
      </header>
      <BackgroundElement />

      <main className="w-full max-w-xl px-6 mt-8 space-y-6">

        {/* 1. PERSONAL DETAILS */}
        <Card className="bg-[#444]/20 border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <div className="rounded-xl relative bg-black/50 overflow-hidden">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="border-none h-12 pl-10 focus-visible:ring-0" />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nickname</Label>
              <div className="rounded-xl relative bg-black/50 overflow-hidden">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="What should we call you?" value={nickname} onChange={(e) => setNickname(e.target.value)} className="border-none h-12 pl-10 focus-visible:ring-0" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. EDUCATION */}
        <Card className="bg-[#444]/20 border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg">Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Class</Label>
                <Select value={className} onValueChange={(value) => setClassName(value ?? "10") }>
                  <SelectTrigger className="bg-black border-white/10 h-12 rounded-xl">
                    <SelectValue placeholder="Class 9th" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10">
                    <SelectItem value="9">Class 9th</SelectItem>
                    <SelectItem value="10">Class 10th</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Board</Label>
                <Select value={board} onValueChange={(value) => setBoard(value ?? "CBSE") }>
                  <SelectTrigger className="bg-black border-white/10 h-12 rounded-xl">
                    <SelectValue placeholder="CBSE" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10">
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Medium</Label>
              <div className="flex gap-2">
                {["English", "Hindi"].map((m) => (
                  <Badge
                    key={m}
                    variant={medium === m ? "default" : "outline"}
                    className={cn(
                      "h-10 px-6 rounded-full cursor-pointer transition-all",
                      medium === m ? "bg-cyan-500 hover:bg-cyan-600 text-black font-bold" : "border-white/10 text-muted-foreground"
                    )}
                    onClick={() => setMedium(m)}
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. LOCATION */}
        <Card className="bg-[#444]/20 border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg">Location & Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1.5fr_1fr] gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="bg-black border-white/10 h-12 pl-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">State</Label>
                <Select value={state} onValueChange={(value) => setState(value ?? "Maharashtra") }>
                  <SelectTrigger className="bg-black border-white/10 h-12 rounded-xl">
                    <SelectValue placeholder="MH" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. PREFERENCES (DYNAMIC) */}
        <Card className="bg-[#444]/20 border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-lg">Academic Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Subjects */}
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Preferred Subjects</Label>
              <div className="flex flex-wrap gap-2">
                {allSubjects.map((subject) => {
                  const isSelected = preferredSubjects.includes(subject);
                  return (
                    <Badge
                      key={subject}
                      onClick={() => toggleSubject(subject, "preferred")}
                      className={cn(
                        "h-9 px-4 rounded-full cursor-pointer transition-all border-none",
                        isSelected
                          ? "bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {subject} {isSelected && "✓"}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Weak Subjects */}
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Weak Subjects</Label>
              <div className="flex flex-wrap gap-2">
                {allSubjects.map((subject) => {
                  const isSelected = weakSubjects.includes(subject);
                  return (
                    <Badge
                      key={subject}
                      onClick={() => toggleSubject(subject, "weak")}
                      className={cn(
                        "h-9 px-4 rounded-full cursor-pointer transition-all border-none",
                        isSelected
                          ? "bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {subject} {isSelected && "✓"}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

      </main>

      {/* FOOTER */}
      <footer className=" bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent flex justify-center z-50">
        <div className="w-full max-w-xl">
          <Button
            onClick={handleContinue}
            disabled={createProfile.isPending || !fullName.trim()}
            className={cn(
              "w-full h-14 rounded-full text-white text-lg font-bold tracking-wide transition-all duration-300",
              "bg-gradient-to-b from-[#1e3a8a] to-[#091050]",
              "border-[1.5px] border-[#3b82f6]",
              "shadow-[0_0_20px_rgba(37,99,235,0.5)]",
              "hover:brightness-125 hover:shadow-[0_0_30px_rgba(37,99,235,0.7)]",
              "active:scale-[0.98] active:brightness-90"
            )}
          >
            {createProfile.isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}