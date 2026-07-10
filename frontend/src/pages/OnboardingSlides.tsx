import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Brain, Trophy, Users, Star, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    id: 0,
    title: "24×7 Live\nTeacher Support",
    subtitle: "Get instant academic help anytime\nthrough chat, audio, or video calls.",
  },
  {
    id: 1,
    title: "AI-Powered\nDoubt Solving",
    subtitle: "Ask any question and get detailed,\nstep-by-step AI explanation instantly.",
  },
  {
    id: 2,
    title: "Track Your\nProgress Daily",
    subtitle: "Solve customized daily MCQ tests\nand see your analytics grow.",
  },
  {
    id: 3,
    title: "Start Your\n3-Day Trial for ₹1",
    subtitle: "Our Premium USP! Access all features\nincluding live calls for just ₹1 setup.",
  },
];

export default function OnboardingSlides() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

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

  const renderSlideImage = (id: number) => {
    let content;

    if (id === 0) {
      content = (
        <div className="w-full h-full rounded-[32px] bg-white border border-slate-200/80 shadow-md flex flex-col items-center justify-center p-6 gap-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-green-500/10 text-green-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase animate-pulse">
            Live Online
          </div>
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 shadow-inner">
            <Users size={36} strokeWidth={2.5} />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Chat</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Audio Call</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Video Call</span>
          </div>
        </div>
      );
    } else if (id === 1) {
      content = (
        <div className="w-full h-full rounded-[32px] bg-white border border-slate-200/80 shadow-md flex flex-col items-center justify-center p-6 gap-4 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
            24x7 Instant
          </div>
          <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 shadow-inner">
            <Brain size={36} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Step-by-Step Explanations
          </p>
        </div>
      );
    } else if (id === 2) {
      content = (
        <div className="w-full h-full rounded-[32px] bg-white border border-slate-200/80 shadow-md flex flex-col items-center justify-center p-6 gap-4 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
            Quizzes & Tests
          </div>
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <Trophy size={36} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Daily MCQs & analytics
          </p>
        </div>
      );
    } else {
      content = (
        <div className="w-full h-full rounded-[32px] bg-[#d5a848]/10 border-2 border-[#d5a848] shadow-md flex flex-col items-center justify-center p-6 gap-3 relative overflow-hidden bg-gradient-to-b from-white to-[#d5a848]/5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex flex-col items-center justify-center text-white shadow-lg border-2 border-white/50 relative">
            <span className="text-4xl font-black tracking-tighter">₹1</span>
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">Only</span>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide">
              3-DAY FREE TRIAL
            </h3>
            <p className="text-[10px] text-slate-500 font-bold max-w-[200px] mx-auto leading-tight">
              Test all features including live call support for just ₹1 setup fee!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-72 h-72 md:w-80 md:h-80 relative flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-64 h-64 md:w-72 md:h-72 flex items-center justify-center select-none"
        >
          {content}
        </motion.div>
      </div>
    );
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="min-h-screen w-full bg-[#d6ebff] text-slate-800 flex flex-col items-center justify-between relative overflow-hidden pb-10 transition-colors duration-300 font-sans">
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-between relative z-10">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pt-8 px-6 z-10">
          <button
            onClick={goBack}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 transition-colors shrink-0"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h2 className="text-sm font-black tracking-widest text-blue-900 uppercase select-none">
            VLM ACADEMY
          </h2>
          <div className="w-9" />
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-4 z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center text-center gap-6 w-full"
            >
              {/* Feature Area */}
              {renderSlideImage(slide.id)}

              {/* Text */}
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-blue-900 whitespace-pre-line leading-tight">
                  {slide.title}
                </h1>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-[280px] mx-auto whitespace-pre-line font-bold">
                  {slide.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: Dots + Next button + Skip */}
        <div className="w-full px-6 flex flex-col items-center gap-6 z-10">
          {/* Indicator dots */}
          <div className="flex items-center gap-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300 cursor-pointer",
                  i === current ? "w-8 h-1.5 bg-blue-900" : "w-1.5 h-1.5 bg-slate-300"
                )}
              />
            ))}
          </div>

          {/* Buttons (Next & Skip) */}
          <div className="w-full flex items-center justify-between gap-6 pl-4">
            <div className="w-12" /> {/* alignment spacer */}
            <button
              onClick={goNext}
              className="flex-1 max-w-[200px] h-12 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.97] bg-blue-900 text-white shadow-md shadow-blue-950/10 border-none cursor-pointer flex items-center justify-center gap-1.5 hover:brightness-110"
            >
              {isLast ? "Get Started" : "Next"}
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleSkip}
              className="text-xs font-black uppercase tracking-wider text-blue-900 hover:text-blue-950 transition-colors w-12 text-right cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
