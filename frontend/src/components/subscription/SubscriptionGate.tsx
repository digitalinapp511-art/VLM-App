/**
 * SubscriptionGate.tsx
 *
 * Wrap any premium feature with this component. If the user isn't subscribed,
 * it shows a bottom sheet with the correct CTA (trial OR full plan, depending
 * on hasUsedTrial).
 *
 * Usage:
 *   <SubscriptionGate feature="humanChat">
 *     <HumanChatPage />
 *   </SubscriptionGate>
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useSubscription } from "@/hooks/use-subscription";
import {
  MessageSquare, Phone, Video, BookOpen, ClipboardList, Upload,
  X, Crown, ChevronRight, Sparkles, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export type GatedFeature =
  | "humanChat"
  | "call"
  | "video"
  | "library"
  | "quiz"
  | "uploadVideo";

const FEATURE_META: Record<GatedFeature, { icon: any; label: string; description: string }> = {
  humanChat: {
    icon: MessageSquare,
    label: "Human Chat",
    description: "Chat with real expert teachers 24/7 for instant doubt resolution.",
  },
  call: {
    icon: Phone,
    label: "Audio Call",
    description: "Connect with a teacher over a live voice call for deep learning.",
  },
  video: {
    icon: Video,
    label: "Video Call",
    description: "Face-to-face video sessions with verified expert teachers.",
  },
  library: {
    icon: BookOpen,
    label: "Library",
    description: "Access thousands of NCERT & CBSE study resources and PDF notes.",
  },
  quiz: {
    icon: ClipboardList,
    label: "Quiz & MCQ",
    description: "Practice with daily quizzes, chapter tests, and mock exams.",
  },
  uploadVideo: {
    icon: Upload,
    label: "Video Upload",
    description: "Upload and share your educational short videos with the community.",
  },
};

const PREMIUM_BENEFITS = [
  { icon: MessageSquare, text: "Enable Human Chat & Calls" },
  { icon: BookOpen, text: "Full Library & Study Materials" },
  { icon: ClipboardList, text: "Daily Quizzes & Chapter Tests" },
  { icon: Video, text: "Live Video Sessions" },
];

interface SubscriptionGateProps {
  feature: GatedFeature;
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function SubscriptionGate({ feature, children, onClose }: SubscriptionGateProps) {
  const { isPremium, hasUsedTrial, planPrice } = useSubscription();
  const [sheetOpen, setSheetOpen] = useState(true);
  const navigate = useNavigate();

  // If premium — just render children
  if (isPremium) return <>{children}</>;

  const meta = FEATURE_META[feature];
  const Icon = meta.icon;

  const handleSubscribeClick = () => {
    setSheetOpen(false);
    onClose?.();
    navigate(PATHS.PLAN_SCREEN);
  };

  const handleClose = () => {
    setSheetOpen(false);
    onClose?.();
  };

  const handleBackToDashboard = () => {
    setSheetOpen(false);
    onClose?.();
    navigate(PATHS.STUDENT_DASHBOARD);
  };

  return (
    <>
      {/* Feature Content */}
      {children}

      {/* App Theme Drop-up Bottom Sheet Modal */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-[999] flex items-end justify-center p-0 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-[#120d2d] rounded-t-[2.5rem] border-t border-slate-200 dark:border-violet-500/20 p-6 pb-8 z-10 shadow-[0_-15px_50px_rgba(124,58,237,0.15)] flex flex-col gap-5 text-slate-800 dark:text-slate-100 font-sans"
            >
              {/* Grab Handle */}
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700/60 rounded-full mx-auto -mt-1 mb-0.5" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-white/70 hover:text-slate-800 dark:hover:text-white transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 pt-1">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-md" />
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/25 border border-violet-400/20 text-white shrink-0">
                    <Icon size={26} strokeWidth={2.2} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 dark:bg-amber-400/15 border border-amber-400/30 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <Crown size={11} className="text-amber-500 fill-amber-500" />
                    PREMIUM FEATURE
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Unlock {meta.label}
                  </h2>
                </div>
              </div>

              {/* Description Banner */}
              <div className="bg-gradient-to-r from-violet-50/90 to-indigo-50/90 dark:from-violet-950/40 dark:to-indigo-950/40 p-4 rounded-2xl border border-violet-100 dark:border-violet-800/40 text-slate-700 dark:text-slate-200 text-xs font-semibold leading-relaxed shadow-sm">
                {meta.description}
              </div>

              {/* Benefits list */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                    Included with Subscription:
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {PREMIUM_BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 px-3 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <div className="h-7 w-7 rounded-lg bg-violet-500/10 dark:bg-amber-400/10 text-violet-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-violet-500/10 dark:border-amber-400/20">
                        <benefit.icon size={14} />
                      </div>
                      <span className="text-xs text-slate-700 dark:text-slate-200 font-extrabold flex-1">{benefit.text}</span>
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleSubscribeClick}
                  className="w-full h-14 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-550 text-white border border-violet-400/20 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Crown size={18} className="text-amber-300 fill-amber-300 drop-shadow" />
                  <span>
                    {!hasUsedTrial ? "START 3-DAY TRIAL — ₹1 ONLY" : `SUBSCRIBE NOW — ₹${planPrice || "79"}/MONTH`}
                  </span>
                  <ChevronRight size={16} />
                </Button>
                <button
                  onClick={handleBackToDashboard}
                  className="w-full text-center text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors py-1 cursor-pointer"
                >
                  Back to Home Dashboard
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
