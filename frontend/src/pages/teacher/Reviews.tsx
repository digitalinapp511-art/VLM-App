import React from "react";
import { ChevronLeft, Star, MessageSquareOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { PATHS } from "@/routes/paths";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reviews() {
  const navigate = useNavigate();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["teacherReviews"],
    queryFn: teacherApi.getReviews,
  });

  return (
    <div className={cn("min-h-screen flex flex-col bg-[#050914] text-white overflow-hidden relative", bgCss)}>
      
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] left-[10%] w-[250px] h-[250px] bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-xl lg:max-w-3xl mx-auto flex-1 flex flex-col relative z-10 px-4">
        
        {/* Header */}
        <div className="pt-6 pb-4 shrink-0 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(PATHS.TEACHER_DASHBOARD)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">My Reviews</h1>
          </div>
        </div>

        {/* Reviews List */}
        <main className="flex-1 overflow-y-auto py-6 hide-scrollbar flex flex-col gap-4">
          
          {isLoading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3 bg-white/10" />
                      <Skeleton className="h-3 w-1/4 bg-white/10" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full bg-white/10" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && reviews.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center opacity-50 mt-10">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <MessageSquareOff size={32} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">No Reviews Yet</p>
                <p className="text-xs text-white/50">Your students' feedback will appear here.</p>
              </div>
            </div>
          )}

          {!isLoading && reviews.length > 0 && reviews.map((review: any) => {
            const studentName = review.studentId?.fullName || review.studentId?.nickname || "Student";
            const initial = studentName.charAt(0).toUpperCase();
            
            return (
              <div key={review._id} className="p-5 rounded-[24px] bg-[#1a1e2b] border border-white/10 shadow-xl relative overflow-hidden transition-all hover:border-white/20">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex gap-3 items-center">
                    <Avatar className="w-10 h-10 border border-white/10 bg-black/40">
                      <AvatarImage src={review.studentId?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}`} />
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{studentName}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                    <span className="text-xs font-black text-yellow-500 mr-1">{review.overallRating || 5}</span>
                    <Star size={12} fill="currentColor" className="text-yellow-500 mb-0.5" />
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-[13px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
                    {review.feedback || "No additional comments provided by the student."}
                  </p>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
