import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 0,
    emoji: "🎓",
    logo: "VLM ACADEMY",
    title: "24×7 Live\nTeacher Support",
    subtitle: "Get instant help anytime through\nchat, audio, or video.",
    accent: "#3b82f6",
    glow: "rgba(59,130,246,0.35)",
    bg: "from-[#0a0a1a] via-[#0d1224] to-[#070710]",
  },
  {
    id: 1,
    emoji: "🤖",
    logo: "VLM ACADEMY",
    title: "AI-Powered\nDoubt Solving",
    subtitle: "Ask any question, get instant AI\nexplanations with step-by-step solutions.",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.35)",
    bg: "from-[#0a0a1a] via-[#100d24] to-[#070710]",
  },
  {
    id: 2,
    emoji: "📊",
    logo: "VLM ACADEMY",
    title: "Track Your\nProgress Daily",
    subtitle: "MCQ quizzes, performance scores\nand smart learning plans built for you.",
    accent: "#06b6d4",
    glow: "rgba(6,182,212,0.35)",
    bg: "from-[#0a0a1a] via-[#0a1520] to-[#070710]",
  },
  {
    id: 3,
    emoji: "🏆",
    logo: "VLM ACADEMY",
    title: "Earn Rewards\nAs You Learn",
    subtitle: "Complete sessions, win coins\nand redeem them for real benefits.",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    bg: "from-[#0a0a1a] via-[#150f08] to-[#070710]",
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

  const handleSkip = () => {
    navigate(PATHS.LEARNING_PLAN);
  };

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
  };

  return (
    <div
      className={cn(
        "min-h-svh w-full bg-gradient-to-b text-white flex flex-col items-center justify-between relative overflow-hidden",
        slide.bg
      )}
      style={{ transition: "background 0.6s ease" }}
    >
      {/* ── Radial glow blob ── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${slide.glow}, transparent 80%)`,
        }}
      />

      {/* ── Header: Skip ── */}
      <div className="w-full max-w-xs flex justify-end pt-10 px-2">
        <button
          onClick={handleSkip}
          className="text-sm text-white/40 hover:text-white/70 transition-colors font-medium tracking-wide"
        >
          Skip
        </button>
      </div>

      {/* ── Slide content ── */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center text-center gap-6 w-full"
          >
            {/* Big emoji / logo area */}
            <div
              className="w-44 h-44 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 border border-white/8 backdrop-blur-sm"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${slide.glow.replace("0.35", "0.15")}, rgba(255,255,255,0.03))`,
                boxShadow: `0 0 60px ${slide.glow}`,
              }}
            >
              <span className="text-6xl select-none">{slide.emoji}</span>
              <span
                className="text-[10px] font-black tracking-[0.2em] uppercase"
                style={{ color: slide.accent }}
              >
                {slide.logo}
              </span>
            </div>

            {/* Text */}
            <div className="space-y-3">
              <h1 className="text-[26px] font-black tracking-tight leading-tight whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-white/45 text-sm leading-relaxed whitespace-pre-line">
                {slide.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Dots + Next button ── */}
      <div className="w-full max-w-xs px-4 pb-14 flex flex-col items-center gap-8">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-6 h-2"
                  : "w-2 h-2 opacity-40 hover:opacity-60"
              )}
              style={{
                background: i === current ? slide.accent : "#fff",
              }}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        <button
          onClick={goNext}
          className="w-full h-14 rounded-full font-bold text-base tracking-wide transition-all duration-300 active:scale-[0.97] hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${slide.accent}cc, ${slide.accent}88)`,
            border: `1.5px solid ${slide.accent}`,
            boxShadow: `0 0 28px ${slide.glow}`,
            color: "#fff",
          }}
        >
          {isLast ? "Get Started →" : "Next"}
        </button>
      </div>
    </div>
  );
}
