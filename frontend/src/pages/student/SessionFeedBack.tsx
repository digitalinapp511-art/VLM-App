import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Star, Check, X, Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";

// Official Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { bgCss } from "@/helper/CssHelper";

import { studentApi } from "@/lib/student-api";

const submitFeedback = (feedbackData: any) => studentApi.submitFeedback(feedbackData);

export default function SessionFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, doubtId } = (location.state as { sessionId?: string; doubtId?: string }) ?? {};
  const [rating, setRating] = useState(3);
  const [solved, setSolved] = useState<boolean | null>(true);
  const [comment, setComment] = useState("");

  // TanStack Query Mutation
  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      navigate(PATHS.STUDENT_DASHBOARD);
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ rating, solved, comment, sessionId, doubtId });
  };

  return (
    <div className={`${bgCss}relative flex min-h-svh w-full flex-col items-center bg-[#050505] px-6 pt-10 overflow-x-hidden text-white`}>
      <div className="max-w-xl w-full flex flex-col justify-center items-center min-h-svh ">
      
      {/* ── HEADER ── */}
             <header className="relative z-10 flex w-full items-center justify-between mb-2">

        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md" onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}>
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Session Feedback</h1>
        <div className="w-12" />
      </header>

      {/* ── MAIN FEEDBACK CARD ── */}
      <Card className="relative z-10 w-full max-w-md border-white/5 bg-stone-200/5 border-1 border-white/30 backdrop-blur-3xl rounded-xl py-10 shadow-2xl overflow-hidden">
        <CardContent className="flex flex-col items-center space-y-7">
          
          {/* Section 1: Star Rating */}
          <div className="w-full text-center space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight">Rate your session</h3>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90 outline-none">
                  <Star 
                    size={36} 
                    className={cn(
                      "transition-all duration-300",
                      s <= rating ? "text-[#f5a623] fill-[#f5a623] drop-shadow-[0_0_10px_rgba(245,166,35,0.6)]" : "text-white/10"
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-white/5 mx-4" />

          {/* Section 2: Problem Solved Toggle */}
          <div className="w-full text-center space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight">Was your problem solved?</h3>
            <div className="flex justify-center gap-4">
              {/* Yes Button */}
              <Button
                onClick={() => setSolved(true)}
                variant="outline"
                className={cn(
                  "h-14 px-8 rounded-full bg-transparent border-2 transition-all duration-300 gap-2 font-bold",
                  solved === true 
                    ? "border-green-500  text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                    : "border-white/10  text-white/40"
                )}
              >
                <Check size={20} strokeWidth={3} /> Yes
              </Button>

              {/* No Button */}
              <Button
                onClick={() => setSolved(false)}
                variant="outline"
                className={cn(
                  "h-14 px-8 rounded-full border-2 transition-all duration-300 gap-2 font-bold",
                  solved === false 
                    ? "border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                    : "border-white/10 bg-white/5 text-white/40"
                )}
              >
                <X size={20} strokeWidth={3} /> No
              </Button>
            </div>
          </div>

          <div className="w-full h-px bg-white/5 mx-4" />

          {/* Section 3: Comment Field */}
          <div className="w-full space-y-4 px-2">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Comment Field</h3>
              <Pencil size={18} className="text-white/40" />
            </div>
            <Textarea 
              placeholder="Leave a comment about the teacher or session..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[140px] rounded-2xl border-white/5 bg-red-200 p-5 text-sm text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500/40 transition-all resize-none"
            />
          </div>

          {/* Section 4: Submit Button */}
          <div className="w-full pt-4 relative">
            <div className="absolute inset-x-0 bottom-0 top-4 bg-blue-600/30 blur-3xl rounded-full" />
            <Button 
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className={cn(
                "relative w-full h-16 rounded-[2rem] text-lg font-bold tracking-wide transition-all active:scale-[0.98]",
                "bg-gradient-to-b from-[#1e3a8e] to-[#0f172a] border border-blue-500/40 text-white shadow-2xl"
              )}
            >
              {mutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
    </div>
  );
}