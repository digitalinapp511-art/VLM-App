import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../assets/logo.png";

const SLIDES = [
  {
    id: 0,
    title: "24×7 Live\nTeacher Support",
    subtitle: "Get instant help anytime through\nchat, audio, or video.",
  },
  {
    id: 1,
    title: "AI-Powered\nDoubt Solving",
    subtitle: "Ask any question, get instant AI\nexplanations with step-by-step solutions.",
  },
  {
    id: 2,
    title: "Track Your\nProgress Daily",
    subtitle: "MCQ quizzes, performance scores\nand smart learning plans built for you.",
  },
  {
    id: 3,
    title: "Earn Rewards\nAs You Learn",
    subtitle: "Complete sessions, win coins\nand redeem them for real benefits.",
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
    switch (id) {
      case 0:
        return (
          <div className="w-72 h-72 md:w-80 md:h-80 relative flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-56 h-56 md:w-64 md:h-64 flex items-center justify-center select-none"
            >
              <img
                src={logoImage}
                alt="VLM Academy Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
              />
            </motion.div>
          </div>
        );
      case 1:
        return (
          <div className="w-72 h-72 md:w-80 md:h-80 relative flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-56 h-56 md:w-64 md:h-64 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-full h-full text-purple-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.65)]" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="8" cy="16" r="1.5" />
                <circle cx="16" cy="16" r="1.5" />
                <path d="M9 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2v5" strokeLinecap="round"/>
              </svg>
            </motion.div>
          </div>
        );
      case 2:
        return (
          <div className="w-72 h-72 md:w-80 md:h-80 relative flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              className="w-56 h-56 md:w-64 md:h-64 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.65)]" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="7" y="15" width="2" height="3" rx="0.5" />
                <rect x="11" y="12" width="2" height="6" rx="0.5" />
                <rect x="15" y="8" width="2" height="10" rx="0.5" />
              </svg>
            </motion.div>
          </div>
        );
      case 3:
        return (
          <div className="w-72 h-72 md:w-80 md:h-80 relative flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
              className="w-56 h-56 md:w-64 md:h-64 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-full h-full text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.65)]" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                <path d="M12 2a7 7 0 0 1 7 7v4a7 7 0 0 1-7 7a7 7 0 0 1-7-7V9a7 7 0 0 1 7-7z" />
              </svg>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="min-h-svh w-full bg-[#0d0d0d] flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md min-h-svh md:min-h-[85vh] md:max-h-[850px] bg-[#151515] text-white flex flex-col items-center justify-between relative overflow-hidden pb-10 md:rounded-[3rem] md:border-4 md:border-neutral-800 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        {/* ── Background circles ── */}
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/[0.01] pointer-events-none" />

        {/* ── Header: VLM Academy & Back Arrow ── */}
        <div className="w-full flex items-center justify-between pt-10 px-6 z-10">
          <div className="w-6" /> {/* spacer */}
          <h2 className="font-serif text-[15px] tracking-[0.2em] text-white/90 uppercase font-semibold text-center select-none">
            VLM Academy
          </h2>
          <button
            onClick={goBack}
            className="text-white/20 hover:text-white/50 transition-colors flex items-center justify-center p-1"
          >
            {/* Back Triangle */}
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M14 7l-5 5 5 5V7z" />
            </svg>
          </button>
        </div>

        {/* ── Slide content ── */}
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
              className="flex flex-col items-center text-center gap-6 md:gap-10 w-full"
            >
              {/* Logo Image Area */}
              {renderSlideImage(slide.id)}

              {/* Text */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white whitespace-pre-line leading-tight">
                  {slide.title}
                </h1>
                <p className="text-white/70 text-sm md:text-[15px] leading-relaxed max-w-[280px] mx-auto whitespace-pre-line">
                  {slide.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer: Dots + Next button + Skip ── */}
        <div className="w-full px-6 flex flex-col items-center gap-6 md:gap-8 z-10">
          {/* Indicator dots */}
          <div className="flex items-center gap-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current ? "w-8 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"
                )}
              />
            ))}
          </div>

          {/* Buttons (Next & Skip) */}
          <div className="w-full flex items-center justify-between gap-6 pl-4">
            <div className="w-12" /> {/* alignment spacer */}
            <button
              onClick={goNext}
              className="flex-1 max-w-[200px] h-12 rounded-full font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.97] bg-gradient-to-r from-[#172554] to-[#0f172a] border border-[#1e40af]/40 text-white shadow-lg hover:brightness-110"
            >
              {isLast ? "Get Started" : "Next"}
            </button>
            <button
              onClick={handleSkip}
              className="text-sm font-semibold text-sky-500 hover:text-sky-400 transition-colors w-12 text-right"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
