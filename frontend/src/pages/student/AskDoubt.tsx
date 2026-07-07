/**
 * AskDoubt.tsx — student side
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigned to match the light, gamified VLM Academy dashboard theme.
 * Added fully functional image upload & camera capture functionality.
 */
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, Bell, Camera, Image as ImageIcon,
  Bot, MessageCircle, Phone, Video, X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";

import { studentApi } from "@/lib/student-api";
import { useStudentProfile } from "@/hooks/use-student";
import StudentBottomNav from "@/features/student/components/layout/StudentBottomNav";
import { toast } from "sonner";

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
  const [sessionType, setSessionType] = useState("AI Tutor");
  const navigate = useNavigate();
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const { data: profile } = useStudentProfile();

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      toast.success("Image attached!");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleConnect = async () => {
    const getSessionTypeString = (type: string) => {
      if (type === "Human Chat") return "chat";
      if (type === "Audio Call") return "audio";
      if (type === "Video Call") return "video";
      return "ai"; // AI Tutor
    };

    setUploading(true);
    try {
      let doubt;
      const typeStr = getSessionTypeString(sessionType);
      
      if (selectedImage) {
        // Submit doubt with image using multipart/form-data
        const formData = new FormData();
        formData.append("images", selectedImage);
        formData.append("subject", selectedSubjectName || "Mathematics");
        formData.append("class", (profile as any)?.class || (profile as any)?.className || "10");
        formData.append("board", (profile as any)?.board || "CBSE");
        formData.append("language", "Hindi");
        formData.append("sessionType", typeStr);
        formData.append("doubtText", question);
        formData.append("topic", selectedChapterId || "");

        doubt = await studentApi.submitDoubtWithImages(formData);
      } else {
        // Submit text-only doubt
        doubt = await studentApi.createDoubt({
          subject: selectedSubjectName || "Mathematics",
          class: (profile as any)?.class || (profile as any)?.className || "10",
          board: (profile as any)?.board || "CBSE",
          language: "Hindi",
          sessionType: typeStr,
          doubtText: question,
          topic: selectedChapterId || "",
        });
      }

      toast.success("Doubt request submitted successfully!");

      const uploadedImgUrl = doubt?.data?.doubtRequest?.doubtImage || doubt?.data?.session?.doubtImage || "";
      if (sessionType === "AI Tutor") {
        navigate(PATHS.AI_CHAT, {
          state: {
            initialQuestion: question,
            initialImage: uploadedImgUrl,
            fromAskDoubt: true
          }
        });
      } else {
        navigate(PATHS.TEACHER_SEARCHING, {
          state: {
            doubtId: doubt?.data?.doubtRequest?._id || doubt?.data?.session?._id || doubt?.id,
            sessionId: doubt?.data?.session?._id,
            subjectName: selectedSubjectName || "Mathematics",
            className: (profile as any)?.class || (profile as any)?.className || "10th",
            sessionType: sessionType,
            initialQuestion: question,
            initialImage: uploadedImgUrl,
          }
        });
      }
    } catch (err: any) {
      console.error("Error submitting doubt:", err);
      toast.error(err?.response?.data?.message || "Failed to submit doubt.");
    } finally {
      setUploading(false);
    }
  };

  const { data: subjects } = useQuery<{ id: string; name: string }[]>({ queryKey: ["subjects"], queryFn: fetchSubjects });
  const { data: chapters } = useQuery<Chapter[]>({
    queryKey: ["chapters", selectedSubjectName],
    queryFn: () => fetchChapters(selectedSubjectName),
    enabled: !!selectedSubjectName
  });

  return (
    <div className="min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col items-center pb-28 overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* ── HEADER ── */}
      <header className="w-full max-w-xl flex items-center justify-between px-6 py-6 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Ask Your Doubt</h1>
        <button
          onClick={() => navigate(PATHS.STUDENT_NOTIFICATIONS)}
          className="relative h-10 w-10 rounded-full bg-white dark:bg-[#161233] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-90 transition-transform"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white" />
        </button>
      </header>

      <main className="w-full max-w-xl px-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ── INPUT SECTION CARD ── */}
        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#161233] rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-5 space-y-4">
            
            {/* Subject Select */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-black">Select Subject</Label>
              <Select onValueChange={(val: string | null) => {
                const selectedId = String(val ?? "");
                const sub = subjects?.find((s: { id: string; name: string }) => s.id === selectedId);
                setSelectedSubjectName(sub?.name ?? "");
                setSelectedSubjectId(selectedId);
              }}>
                <SelectTrigger className="rounded-2xl w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-250 focus:ring-violet-500/50">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-855 dark:text-white">
                  {subjects?.map((s: { id: string; name: string }) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Select */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-black">Select Chapter</Label>
              <Select onValueChange={(value: string | null) => setSelectedChapterId(value ?? "")}>
                <SelectTrigger className="w-full rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-250 focus:ring-violet-500/50">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-855 dark:text-white">
                  {chapters?.map((c: Chapter) => {
                    const value = typeof c === "string" ? c : c.id ?? c.name ?? "";
                    const label = typeof c === "string" ? c : c.name ?? value;
                    return <SelectItem key={value} value={value}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Question Area */}
            <div className="space-y-1.5 relative">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-black">Type your question</Label>
              <Textarea
                placeholder="Type your detailed question here..."
                className="min-h-[160px] rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-855 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 p-4 focus-visible:ring-violet-500/50"
                maxLength={1000}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <span className="absolute bottom-4 right-4 text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-widest">
                {question.length} / 1000
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── ATTACH IMAGE SECTION ── */}
        <div className="space-y-2 px-1">
          <div className="flex justify-between items-center">
            <Label className="text-slate-800 dark:text-slate-200 text-xs font-black">Attach Image (Optional)</Label>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
              {selectedImage ? "Added: 1/3" : "Added: 0/3"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161233] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 gap-2 font-bold transition-all shadow-sm"
            >
              <Camera className="h-4 w-4 text-violet-600" /> Take Photo
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161233] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 gap-2 font-bold transition-all shadow-sm"
            >
              <ImageIcon className="h-4 w-4 text-violet-600" /> Upload Image
            </Button>
          </div>
        </div>

        {/* ── IMAGE PREVIEW ── */}
        {imagePreview && (
          <div className="relative mx-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161233] p-3 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <img src={imagePreview} alt="Preview" className="h-14 w-14 object-cover rounded-xl border border-slate-100 dark:border-slate-850" />
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-white">Attached Doubt Photo</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {selectedImage?.size ? (selectedImage.size / 1024 / 1024).toFixed(2) + " MB" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={removeImage}
              className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/25 flex items-center justify-center font-bold text-xs"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── SESSION TYPE SELECTION ── */}
        <div className="space-y-2 px-1">
          <Label className="text-slate-800 dark:text-slate-200 text-xs font-black">Choose Session Type</Label>
          {/* Scrollable list with negative margins to prevent corner clipping */}
          <div className="flex overflow-x-auto gap-3 px-2 py-3 -mx-2 -my-2 snap-x no-scrollbar">
            <SessionCard
              icon={<Bot size={18} />}
              title="AI Tutor"
              desc="Instant Help from AI"
              active={sessionType === "AI Tutor"}
              onClick={() => setSessionType("AI Tutor")}
            />
            <SessionCard
              icon={<MessageCircle size={18} />}
              title="Human Chat"
              desc="Expert Educator"
              active={sessionType === "Human Chat"}
              onClick={() => setSessionType("Human Chat")}
            />
            <SessionCard
              icon={<Phone size={18} />}
              title="Audio Call"
              desc="Live Discussion"
              active={sessionType === "Audio Call"}
              onClick={() => setSessionType("Audio Call")}
            />
            <SessionCard
              icon={<Video size={18} />}
              title="Video Call"
              desc="Personalized Session"
              active={sessionType === "Video Call"}
              onClick={() => setSessionType("Video Call")}
            />
          </div>
        </div>

        {/* ── SUBMIT BUTTON ── */}
        <div className="pt-2">
          <Button
            onClick={handleConnect}
            disabled={uploading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black tracking-wider text-base shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {uploading ? "UPLOADING..." : (sessionType === "AI Tutor" || sessionType === "Human Chat") ? "CHAT NOW" : "CONNECT NOW"}
          </Button>
        </div>
      </main>

      <StudentBottomNav />
    </div>
  );
}

// ── Reusable Session Card ──
function SessionCard({ icon, title, desc, active, onClick }: any) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer flex-none w-[120px] shrink-0 rounded-2xl transition-all duration-300 border-slate-200/80 dark:border-slate-800 shadow-sm",
        active 
          ? "bg-violet-50 dark:bg-violet-950/30 border-violet-400 dark:border-violet-500 text-violet-700 dark:text-violet-300 ring-1 ring-violet-400 dark:ring-violet-500" 
          : "bg-white dark:bg-[#161233] hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400"
      )}
    >
      <CardContent className="p-3 flex flex-col items-center text-center gap-2">
        <div className={cn(
          "p-2.5 rounded-xl transition-colors",
          active ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" : "bg-slate-100 dark:bg-slate-900 text-slate-400"
        )}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className={cn("text-[9px] font-black uppercase tracking-tight", active ? "text-violet-700 dark:text-violet-300" : "text-slate-800 dark:text-slate-200")}>
            {title}
          </p>
          <p className="text-[8px] text-slate-400 dark:text-slate-500 leading-tight">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}