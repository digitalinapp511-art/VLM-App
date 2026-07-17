import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import studentApi from "@/lib/student-api";

interface SlideData {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

const DEFAULT_SLIDES: SlideData[] = [
  {
    title: "Interactive Lessons",
    description: "Learn complex concepts with interactive slides and visual models.",
    imageUrl: "/onboarding1.png",
    order: 1
  },
  {
    title: "24/7 AI Tutor Support",
    description: "Ask doubts anytime and get step-by-step assistance in real-time.",
    imageUrl: "/onboarding2.png",
    order: 2
  },
  {
    title: "Daily Streak Rewards",
    description: "Complete daily MCQs and streak targets to earn double XP multipliers.",
    imageUrl: "/onboarding3.png",
    order: 3
  },
  {
    title: "VLM Premium Plans",
    description: "Unlock full courses, practice test series, and unlimited features.",
    imageUrl: "/onboarding4.png",
    order: 4
  }
];

export default function OnboardingSlides() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const { data: slidesResponse } = useQuery({
    queryKey: ["onboardingSlides"],
    queryFn: () => studentApi.getOnboardingSlides()
  });

  const slides: SlideData[] = slidesResponse?.data?.length > 0 ? slidesResponse.data : DEFAULT_SLIDES;

  const slide = slides[current] || DEFAULT_SLIDES[0];
  const isLast = current === slides.length - 1;

  const goNext = () => {
    if (isLast) {
      navigate(PATHS.LEARNING_PLAN);
      return;
    }
    setDirection(1);
    setCurrent((c) => c + 1);
  };

  const goBack = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSkip = () => {
    navigate(PATHS.LEARNING_PLAN);
  };

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const renderSlideImage = (url: string, title: string) => {
    return (
      <div className="relative flex items-center justify-center transition-all duration-300 w-full h-[280px] sm:h-[350px] md:h-[420px] px-0">
        <div className="w-full h-full flex items-center justify-center select-none">
          <img
            src={url}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="h-screen w-full bg-white text-slate-800 flex flex-col items-center justify-between relative overflow-hidden pb-6 transition-colors duration-300 font-sans">
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-between relative z-10">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pt-4 px-6 z-10">
          <button
            onClick={goBack}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-sm hover:bg-slate-50 transition-colors shrink-0"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h2 className="text-xs font-black tracking-[0.25em] text-blue-950 uppercase select-none">
            VLM ACADEMY
          </h2>
          <div className="w-9" />
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full py-2 z-10 overflow-hidden px-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center text-center gap-4 w-full"
            >
              {/* Feature Area */}
              {renderSlideImage(slide.imageUrl, slide.title)}

              {/* Text */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-blue-950 whitespace-pre-line leading-tight">
                  {slide.title}
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[320px] mx-auto whitespace-pre-line font-bold">
                  {slide.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: Dots + Next button + Skip */}
        <div className="w-full px-6 flex flex-col items-center gap-6 z-10">
          {/* Indicator dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  i === current ? "w-8 bg-blue-600" : "w-1.5 bg-slate-300"
                )}
              />
            ))}
          </div>

          {/* Buttons (Next & Skip) */}
          <div className="w-full flex flex-col items-center gap-3">
            <button
              onClick={goNext}
              className="w-full max-w-[280px] h-12 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.97] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 border-none cursor-pointer flex items-center justify-center gap-1.5 hover:brightness-110"
            >
              {isLast ? "Get Started" : "Next"}
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
            {!isLast && (
              <button
                onClick={handleSkip}
                className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-650 transition-colors cursor-pointer py-1"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
