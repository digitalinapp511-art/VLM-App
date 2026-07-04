import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Brain, LineChart, Trophy } from "lucide-react";
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
    let content;

    if (id === 0) {
      content = (
        <img
          src={logoImage}
          alt="VLM Academy Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
        />
      );
    } else if (id === 1) {
      content = (
        <div className="w-full h-full rounded-[40px] border border-blue-500/20 bg-blue-500/5 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          <Brain className="w-32 h-32 text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]" strokeWidth={1} />
        </div>
      );
    } else if (id === 2) {
      content = (
        <div className="w-full h-full rounded-[40px] border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <LineChart className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" strokeWidth={1} />
        </div>
      );
    } else {
      content = (
        <div className="w-full h-full rounded-[40px] border border-amber-500/20 bg-amber-500/5 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.15)]">
          <Trophy className="w-32 h-32 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" strokeWidth={1} />
        </div>
      );
    }

    return (
      <div className="w-80 h-80 md:w-96 md:h-96 relative flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-72 h-72 md:w-80 md:h-80 flex items-center justify-center select-none"
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
    <div className="min-h-screen w-full bg-[#151515] text-white flex flex-col items-center justify-between relative overflow-hidden pb-10">
      <div className="w-full max-w-xl flex-1 flex flex-col items-center justify-between relative z-10">
        
        {/* ── Background decoration circle ── */}
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-zinc-800/30 pointer-events-none -z-10" />

        {/* ── Header: VLM Academy centered ── */}
        <div className="w-full flex items-center justify-center pt-10 px-6 z-10">
          <h2 style={{ fontFamily: 'Cinzel, serif' }} className="text-base font-bold tracking-[0.2em] text-[#D4AF37] uppercase select-none">
            VLM ACADEMY
          </h2>
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
              className="flex-1 max-w-[200px] h-12 rounded-full font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.97] bg-gradient-to-r from-blue-700 to-indigo-900 border border-blue-500/40 text-white shadow-lg hover:brightness-110 cursor-pointer"
            >
              {isLast ? "Get Started" : "Next"}
            </button>
            <button
              onClick={handleSkip}
              className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors w-12 text-right cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
