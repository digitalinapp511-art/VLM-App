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
    <div className="relative flex min-h-svh w-full flex-col items-center bg-[#f4f6ff] dark:bg-[#0b081e] px-6 py-8 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl w-full flex flex-col min-h-svh pb-24">
      
        {/* ── HEADER ── */}
        <header className="relative z-10 flex w-full items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-[#221c4e] bg-white dark:bg-[#161233] text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
            onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-md font-black tracking-tight uppercase">Session Feedback</h1>
          <div className="w-10" />
        </header>

        {/* ── MAIN FEEDBACK CARD ── */}
        <Card className="border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] rounded-[2.5rem] shadow-sm p-6 text-left">
          <CardContent className="flex flex-col items-center space-y-6 p-0">
            
            {/* Section 1: Star Rating */}
            <div className="w-full text-center space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Rate your session</h3>
              <div className="flex justify-center gap-2.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90 outline-none">
                    <Star 
                      size={32} 
                      className={cn(
                        "transition-all duration-200",
                        s <= rating 
                          ? "text-[#f5a623] fill-[#f5a623] drop-shadow-[0_0_6px_rgba(245,166,35,0.4)]" 
                          : "text-slate-200 dark:text-slate-800 fill-slate-200 dark:fill-slate-800"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-900" />

            {/* Section 2: Problem Solved Toggle */}
            <div className="w-full text-center space-y-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Was your problem solved?</h3>
              <div className="flex justify-center gap-4">
                {/* Yes Button */}
                <Button
                  onClick={() => setSolved(true)}
                  variant="outline"
                  className={cn(
                    "h-12 px-6 rounded-2xl bg-transparent border transition-all duration-300 gap-1.5 font-black text-xs uppercase tracking-wider active:scale-95",
                    solved === true 
                      ? "border-green-500 text-green-500 bg-green-500/5 shadow-sm" 
                      : "border-slate-200 dark:border-[#221c4e] text-slate-400"
                  )}
                >
                  <Check size={16} strokeWidth={3} /> Yes
                </Button>

                {/* No Button */}
                <Button
                  onClick={() => setSolved(false)}
                  variant="outline"
                  className={cn(
                    "h-12 px-6 rounded-2xl bg-transparent border transition-all duration-300 gap-1.5 font-black text-xs uppercase tracking-wider active:scale-95",
                    solved === false 
                      ? "border-rose-500 text-rose-500 bg-rose-500/5 shadow-sm" 
                      : "border-slate-200 dark:border-[#221c4e] text-slate-400"
                  )}
                >
                  <X size={16} strokeWidth={3} /> No
                </Button>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-900" />

            {/* Section 3: Comment Field */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Comment Field</h3>
                <Pencil size={14} className="text-slate-400 dark:text-slate-500" />
              </div>
              <Textarea 
                placeholder="Leave a comment about the teacher or session..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] rounded-2xl border border-slate-200 dark:border-[#221c4e] bg-slate-50/50 dark:bg-slate-900/40 p-4 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-550 focus-visible:ring-1 focus-visible:ring-violet-500 transition-all resize-none"
              />
            </div>

            {/* Section 4: Submit Button */}
            <div className="w-full pt-2">
              <Button 
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-violet-500/20"
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