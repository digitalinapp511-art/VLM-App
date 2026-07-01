import { bgCss } from "@/helper/CssHelper";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, Bell, Camera, Image as ImageIcon,
  Bot, MessageCircle, Phone, Video
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";

import { studentApi } from "@/lib/student-api";
import { useStudentProfile } from "@/hooks/use-student";

type Chapter = { id?: string; name?: string } | string;

const fetchSubjects = async () => {
  const res = await studentApi.getSubjectsWithIds();
  return res?.data || res || [];
};
const fetchChapters = async (subjectName: string) => {
  const res = await studentApi.getChaptersBySubjectName(subjectName);
  return res?.data || res || [];
};

export default function AskDoubt() {
  const location = useLocation();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const [question, setQuestion] = useState(location.state?.question || "");
  const [searchParams] = useSearchParams();
  const [sessionType, setSessionType] = useState(
    searchParams.get("mode") === "ai" ? "AI Tutor" : "AI Tutor"
  );
  const navigate = useNavigate();

  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  const { data: profile } = useStudentProfile();

  const handleConnect = async () => {
    // Map session type to backend expected values
    const getSessionTypeString = (type: string) => {
      if (type === "Human Chat") return "chat";
      if (type === "Audio Call") return "audio";
      if (type === "Video Call") return "video";
      return "ai"; // AI Tutor
    };

    try {
      const doubt = await studentApi.createDoubt({
        subject: selectedSubjectName || "Math",
        class: (profile as any)?.class || (profile as any)?.className || "10",
        board: (profile as any)?.board || "CBSE",
        language: "Hindi",
        sessionType: getSessionTypeString(sessionType),
        doubtText: question,
      });

      if (sessionType === "AI Tutor") {
        navigate(PATHS.AI_CHAT, { state: { initialQuestion: question, fromAskDoubt: true } });
      } else {
        navigate(PATHS.TEACHER_SEARCHING, {
          state: {
            doubtId: doubt?.data?.doubtRequest?._id || doubt?.data?.session?._id || doubt?.id,
            sessionId: doubt?.data?.session?._id,
            subjectName: selectedSubjectName || "Mathematics",
            className: (profile as any)?.class || (profile as any)?.className || "10th",
            sessionType: sessionType
          }
        });
      }
    } catch (err) {
      console.error("Error submitting doubt:", err);
      // API error — stay on page
    }
  };
  // TanStack Query for dynamic data
  const { data: subjects } = useQuery<{ id: string; name: string }[]>({ queryKey: ["subjects"], queryFn: fetchSubjects });
  const { data: chapters } = useQuery<Chapter[]>({
    queryKey: ["chapters", selectedSubjectName],
    queryFn: () => fetchChapters(selectedSubjectName),
    enabled: !!selectedSubjectName
  });

  return (
    <div className={`${bgCss} min-h-svh w-full bg-[#050505] text-white flex flex-col items-center pb-7 overflow-x-hidden`}>

      {/* ── HEADER ── */}
      <header className="w-full max-w-xl flex items-center justify-between px-6 py-8">
        <div className="w-10" />
        <h1 className="text-xl font-bold tracking-tight">Ask Your Doubt</h1>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white"
          onClick={() => navigate(PATHS.STUDENT_NOTIFICATIONS)}
        >
          <Bell className="h-8 w-8" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-black" />
        </Button>
      </header>

      <main className="w-full max-w-xl px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── INPUT SECTION CARD ── */}
        <Card className="border-white/5 bg-[#1a1a1a]/40 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-6 space-y-6">

            {/* Subject Select */}
            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-semibold">Select Subject</Label>
              <Select onValueChange={(val: string | null) => {
                const selectedId = String(val ?? "");
                const sub = subjects?.find((s: { id: string; name: string }) => s.id === selectedId);
                setSelectedSubjectName(sub?.name ?? "");
                setSelectedSubjectId(selectedId);
              }}>
                <SelectTrigger className=" rounded-2xl w-full  border-white/10 bg-black/40 text-white focus:ring-teal-500/50">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a]  border-white/10 text-white">
                  {subjects?.map((s: { id: string; name: string }) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Select */}
            <div className="space-y-2">
              <Label className="text-white/80 text-sm font-semibold">Select Chapter</Label>
              <Select onValueChange={(value: string | null) => setSelectedChapterId(value ?? "")}>
                <SelectTrigger className="w-full rounded-2xl border-white/10 bg-black/40 text-white focus:ring-teal-500/50">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {chapters?.map((c: Chapter) => {
                    const value = typeof c === "string" ? c : c.id ?? c.name ?? "";
                    const label = typeof c === "string" ? c : c.name ?? value;
                    return <SelectItem key={value} value={value}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Question Area */}
            <div className="space-y-2 relative">
              <Textarea
                placeholder="Type your detailed question here..."
                className="min-h-[180px] rounded-2xl border-white/10 bg-black/40 text-white placeholder:text-white/20 p-4 focus-visible:ring-teal-500/50"
                maxLength={1000}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <span className="absolute bottom-4 right-4 text-[10px] text-white/30 font-bold tracking-widest">
                {question.length} / 1000
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── ATTACH IMAGE SECTION ── */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <Label className="text-white font-bold tracking-tight">Attach Image (Optional)</Label>
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Added: 0/3 images</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => navigate(PATHS.VIDEO_UPLOAD)} className="h-14 rounded-full border-teal-500/50 bg-transparent text-teal-400 hover:bg-teal-500/10 gap-2 font-bold transition-all">
              <Camera className="h-5 w-5" /> Take Photo
            </Button>
            <Button variant="outline" onClick={() => navigate(PATHS.VIDEO_UPLOAD)} className="h-14 rounded-full border-teal-500/50 bg-transparent text-teal-400 hover:bg-teal-500/10 gap-2 font-bold transition-all">
              <ImageIcon className="h-5 w-5" /> Upload Image
            </Button>
          </div>
        </div>

        {/* ── SESSION TYPE SELECTION ── */}
        <div >
          <Label className="text-white font-bold tracking-tight px-1">Choose Session Type</Label>
          <div className="flex overflow-x-auto   gap-3 py-4 px-1 snap-x no-scrollbar">

            <SessionCard
              icon={<Bot />}
              title="AI Tutor"
              desc="Instant Help from AI"
              active={sessionType === "AI Tutor"}
              onClick={() => setSessionType("AI Tutor")}
            />

            <SessionCard
              icon={<MessageCircle />}
              title="Human Chat"
              desc="Expert Educator"
              active={sessionType === "Human Chat"}
              onClick={() => setSessionType("Human Chat")}
            />

            <SessionCard
              icon={<Phone />}
              title="Audio Call"
              desc="Live Discussion"
              active={sessionType === "Audio Call"}
              onClick={() => setSessionType("Audio Call")}
            />
            <SessionCard
              icon={<Video />}
              title="Video Call"
              desc="Personalized Session"
              active={sessionType === "Video Call"}
              onClick={() => setSessionType("Video Call")}
            />

          </div>
        </div>

        {/* ── SUBMIT BUTTON ── */}
        <div className="pt-6 relative">
          <div className="absolute inset-x-0 bottom-0 top-6 bg-teal-600/20 blur-3xl rounded-full" />
          <Button onClick={handleConnect} className="relative w-full h-16 rounded-full bg-gradient-to-r from-teal-600 to-blue-700 text-white font-black tracking-widest text-lg shadow-xl hover:brightness-110 active:scale-[0.98] transition-all">
            {(sessionType === "AI Tutor" || sessionType === "Human Chat") ? "CHAT NOW" : "CONNECT NOW"}
          </Button>
        </div>

      </main>
    </div>
  );
}

// ── Reusable Session Card (Using Shadcn Card) ──
function SessionCard({ icon, title, desc, active, onClick }: any) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer flex-none w-[130px] shrink-0 border-white/5 bg-[#1a1a1a]/60 backdrop-blur-md rounded-2xl transition-all duration-300",
        active ? "ring-1 ring-teal-500 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-teal-500/5" : "hover:bg-white/5"
      )}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-3">
        <div className={cn("p-2.5 rounded-xl transition-colors", active ? "bg-teal-500 text-black shadow-lg" : "bg-white/5 text-white/40")}>
          {icon}
        </div>
        <div className="space-y-1">
          <p className={cn("text-[10px] font-black uppercase tracking-tighter", active ? "text-white" : "text-white/60")}>{title}</p>
          <p className="text-[8px] text-white/30 leading-tight leading-none">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}