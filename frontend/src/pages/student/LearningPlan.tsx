import React from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, 
  Video as VideoIcon
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivateTrial, useStudentProfile } from "@/hooks/use-student";
import DashboardLoading from "@/components/basic/DashboardLoading";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import studentApi from "@/lib/student-api";

export default function LearningPlan() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useStudentProfile();
  const activateTrial = useActivateTrial();

  // Parse student class range
  const profileData = (profile as any)?.data ?? profile;
  const studentClassStr = profileData?.class || profileData?.className || "10";
  const classNum = parseInt(String(studentClassStr).replace(/\D/g, ""), 10) || 10;

  const { data: plansResponse } = useQuery({
    queryKey: ["studentPlans", studentClassStr],
    queryFn: () => studentApi.getPlans(String(classNum)),
    enabled: !!studentClassStr
  });

  if (isLoading) return <DashboardLoading />;

  const plans = (plansResponse as any)?.data ?? [];
  const activePlan = plans.find((p: any) => p.duration === "monthly") || plans[0];

  let classRangeText = `Class ${classNum}`;
  if (classNum >= 1 && classNum <= 8) classRangeText = "Classes 1–8";
  else if (classNum >= 9 && classNum <= 10) classRangeText = "Classes 9–10";
  else if (classNum >= 11 && classNum <= 12) classRangeText = "Classes 11–12";

  let priceVal = activePlan ? activePlan.price : (classNum >= 1 && classNum <= 8 ? 59 : classNum >= 11 ? 99 : 79);
  let mrpVal = activePlan ? activePlan.mrp : Math.round(priceVal * 2.5);
  let aiCreditsText = activePlan ? `${activePlan.benefits?.aiCredits || 2000} AI CHAT CREDITS` : `${classNum >= 1 && classNum <= 8 ? 1000 : classNum >= 11 ? 3000 : 2000} AI CHAT CREDITS`;
  let extraPriceText = activePlan && activePlan.callRate !== undefined ? `₹${activePlan.callRate}/min` : (classNum >= 1 && classNum <= 8 ? "₹3/min" : classNum >= 11 ? "₹5/min" : "₹4/min");
  let trialPriceVal = activePlan ? (activePlan.trialPrice ?? 1) : 1;
  let trialDaysVal = activePlan ? (activePlan.trialDays ?? 3) : 3;
  let durationText = activePlan ? (activePlan.duration === "monthly" ? "Monthly Subscription" : activePlan.duration === "yearly" ? "Annual Subscription" : "Quarterly Subscription") : "Monthly Subscription";

  const handleStartTrial = () => {
    // Call activate trial API
    activateTrial.mutate(activePlan?._id || "mock-annual-plan", {
      onSuccess: () => navigate(PATHS.STUDENT_DASHBOARD),
      onError: () => navigate(PATHS.STUDENT_DASHBOARD),
    });
  };

  const features = activePlan && Array.isArray(activePlan.customBenefits) && activePlan.customBenefits.length > 0
    ? activePlan.customBenefits.map((b: any) => ({
        icon: (LucideIcons as any)[b.icon] || LucideIcons.Check,
        title: b.title,
        desc: b.desc
      }))
    : [
        { 
          icon: LucideIcons.BookOpen, 
          title: "COMPLETE STUDY MATERIAL", 
          desc: "NCERT & CBSE Solutions, Reference Book Solutions, Downloadable PDFs." 
        },
        { 
          icon: LucideIcons.Video, 
          title: "CHAPTER-WISE VIDEO LESSONS", 
          desc: "Engaging tutorials by expert teachers." 
        },
        { 
          icon: LucideIcons.MessageSquare, 
          title: `${aiCreditsText} (24x7)`, 
          desc: "Doubts solved instantly, anytime." 
        },
        { 
          icon: LucideIcons.PhoneCall, 
          title: "24x7 WHATSAPP AI TUTOR", 
          desc: "Instant tutoring support on WhatsApp." 
        },
        { 
          icon: LucideIcons.PlayCircle, 
          title: "ENGAGING SHORT VIDEOS", 
          desc: "Key concepts explained in bite-sized videos." 
        },
        { 
          icon: LucideIcons.ClipboardList, 
          title: "DAILY TASK TRACKING", 
          desc: "Organized daily study plans." 
        },
        { 
          icon: LucideIcons.Trophy, 
          title: "DAILY MCQ PRACTICE & QUIZZES", 
          desc: "Master each chapter with regular tests." 
        },
        { 
          icon: LucideIcons.Users, 
          title: "PARENTS ACCESS & PROGRESS REPORTS", 
          desc: "Track learning performance and goals." 
        }
      ];

  return (
    <div className="min-h-screen w-full bg-[#d6ebff] text-slate-800 flex flex-col items-center pb-32 overflow-x-hidden font-sans relative">
      
      {/* Header */}
      <header className="w-full max-w-md pt-6 px-4 flex items-center justify-between z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 transition-colors shrink-0"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex flex-col items-center flex-grow -mr-9">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-blue-900 tracking-tighter uppercase">VLM Academy</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-md px-4 mt-6 flex-1 flex flex-col gap-6">
        
        {/* Title Group */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-blue-900 tracking-tight uppercase">
            Premium Learning Plan
          </h1>
          <div className="inline-block bg-blue-900 text-white text-[9px] font-black tracking-widest px-4 py-1.5 rounded-md uppercase">
            India's First 24/7 Live Teacher Support App 🎓
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="bg-white border-2 border-[#d5a848] rounded-[24px] shadow-md p-6 relative overflow-hidden flex flex-col items-center">
          
          {/* Class Range Badge */}
          <div className="bg-blue-900 text-white text-xs font-black px-6 py-1.5 rounded-full uppercase tracking-wider mb-4">
            {classRangeText}
          </div>

          {/* Pricing Display */}
          <div className="text-center mb-6">
            {mrpVal && mrpVal > priceVal && (
              <div className="flex items-center justify-center gap-1.5 mb-1.5 select-none">
                <span className="text-xs font-bold text-slate-400 line-through">₹{mrpVal}</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Save {Math.round(((mrpVal - priceVal) / mrpVal) * 100)}%
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-[#d5a848] tracking-tight">₹{priceVal}</span>
              <span className="text-xl font-black text-[#d5a848]">only</span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mt-1">
              {durationText}
            </p>
          </div>

          {/* Feature List */}
          <div className="w-full space-y-4 pt-4 border-t border-slate-100">
            {features.map((feat: any, idx: number) => (
              <div key={idx} className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-lg bg-blue-550/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-900">
                  <feat.icon size={16} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black text-slate-800 tracking-wide uppercase">
                    {feat.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Extras Card */}
        <div className="bg-white border border-slate-200/80 rounded-[20px] shadow-sm p-4 flex flex-col gap-3">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-blue-800 tracking-wider uppercase">
              Optional Extras
            </span>
            <h3 className="text-sm font-black text-slate-800">
              Live One-on-One Support
            </h3>
          </div>
          <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white shrink-0">
              <VideoIcon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-700 uppercase">
                Video Call, Call & Chat Support
              </p>
              <p className="text-base font-black text-[#d5a848]">
                {extraPriceText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <footer className="fixed bottom-0 left-0 w-full px-4 pb-6 pt-4 bg-gradient-to-t from-[#d6ebff] via-[#d6ebff]/95 to-transparent flex flex-col items-center gap-2 z-50">
        <p className="text-slate-600 text-[11px] font-bold uppercase tracking-wider">
          Activate trial for <span className="text-blue-900 font-black">₹{trialPriceVal}</span>
        </p>
        <div className="w-full max-w-md relative">
          <Button
            onClick={handleStartTrial}
            disabled={activateTrial.isPending}
            className={cn(
              "w-full h-14 rounded-full text-base font-bold tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10",
              "bg-blue-900 text-white hover:brightness-110",
              "border border-blue-800"
            )}
          >
            {activateTrial.isPending ? "ACTIVATING..." : `START ${trialDaysVal}-DAY TRIAL`}
          </Button>
        </div>
      </footer>
    </div>
  );
}