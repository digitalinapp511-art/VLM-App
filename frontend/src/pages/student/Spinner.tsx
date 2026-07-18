import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { FaCoins, FaStar, FaAward, FaLock, FaTicketAlt, FaRegFrown, FaGift, FaFire, FaRobot, FaQuestionCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { studentApi } from "@/lib/student-api";
import { PATHS } from "@/routes/paths";
import { useStudentProfile } from "@/hooks/use-student";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const renderSegmentIcon = (iconName: string, label: string, sub: string, size = 28) => {
  const iconClass = "text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]";
  const name = (iconName || "").toLowerCase();
  const text = `${label || ""} ${sub || ""}`.toLowerCase();

  // 1. Coins
  if (name === "coins" || text.includes("coin") || text.includes("point")) {
    return <FaCoins size={size} className={iconClass} color="#ffffff" />;
  }
  // 2. XP / Star
  if (name === "xp" || name === "star" || text.includes("xp") || text.includes("star")) {
    return <FaStar size={size} className={iconClass} color="#ffffff" />;
  }
  // 3. Badge / Medal / Star Learner
  if (name === "badge" || name === "medal" || text.includes("badge") || text.includes("learner") || text.includes("award")) {
    return <FaAward size={size} className={iconClass} color="#ffffff" />;
  }
  // 4. Lock
  if (name === "lock" || text.includes("lock")) {
    return <FaLock size={size} className={iconClass} color="#ffffff" />;
  }
  // 5. Streak / Freeze / Fire
  if (name === "streak" || name === "freeze" || name === "fire" || text.includes("streak") || text.includes("freeze")) {
    return <FaFire size={size} className={iconClass} color="#ffffff" />;
  }
  // 6. Ticket / Coupons
  if (name === "ticket" || name === "coupon" || text.includes("coupon") || text.includes("ticket") || text.includes("%")) {
    return <FaTicketAlt size={size} className={iconClass} color="#ffffff" />;
  }
  // 7. Frown / Try again
  if (name === "frown" || name === "none" || text.includes("frown") || text.includes("try") || text.includes("luck") || text.includes("again")) {
    return <FaRegFrown size={size} className={iconClass} color="#ffffff" />;
  }
  // 8. Gift / Surprise
  if (name === "gift" || name === "random" || name === "surprise" || text.includes("surprise") || text.includes("reward") || text.includes("gift")) {
    return <FaGift size={size} className={iconClass} color="#ffffff" />;
  }
  // 9. AI / Robot
  if (name === "ai" || name === "robot" || text.includes("ai") || text.includes("robot")) {
    return <FaRobot size={size} className={iconClass} color="#ffffff" />;
  }
  // 10. Doubt / Question
  if (name === "doubt" || text.includes("doubt") || text.includes("question")) {
    return <FaQuestionCircle size={size} className={iconClass} color="#ffffff" />;
  }
  return <FaGift size={size} className={iconClass} color="#ffffff" />;
};

export default function SpinnerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, refetch: refetchProfile } = useStudentProfile();

  const { data: spinSettingsResponse } = useQuery({
    queryKey: ["spinSettings"],
    queryFn: () => studentApi.getSpinSettings()
  });

  const dbSegments = spinSettingsResponse?.data || [];

  const SEGMENTS = dbSegments.length > 0
    ? dbSegments.map((s: any) => {
        const parts = s.name.split(" ");
        return {
          id: s.id || s._id,
          label: parts[0] || "REWARD",
          sub: parts.slice(1).join(" ").toUpperCase() || "",
          color: s.color || "#7c3aed",
          type: s.type || "none",
          amount: s.amount || 0,
          icon: s.icon || s.type || "",
          name: s.name,
          title: s.title || "",
          message: s.message || "",
          value: s.value || ""
        };
      })
    : [
        { id: 1, label: "50", sub: "POINTS", color: "#ff4b5c", type: "coins", amount: 50, icon: "coins", name: "50 Coins", title: "", message: "", value: "" },
        { id: 2, label: "₹100", sub: "OFF", color: "#ff9233", type: "none", amount: 0, icon: "ticket", name: "₹100 OFF", title: "", message: "", value: "" },
        { id: 3, label: "10", sub: "CREDITS", color: "#ffcd3c", type: "chat_credit", amount: 10, icon: "star", name: "10 Credits", title: "", message: "", value: "" },
        { id: 4, label: "25", sub: "POINTS", color: "#3de6af", type: "coins", amount: 25, icon: "coins", name: "25 Points", title: "", message: "", value: "" },
        { id: 5, label: "TRY", sub: "AGAIN", color: "#20d3f2", type: "none", amount: 0, icon: "frown", name: "Try Again", title: "", message: "", value: "" },
        { id: 6, label: "5", sub: "CREDITS", color: "#4b89ff", type: "chat_credit", amount: 5, icon: "star", name: "5 Credits", title: "", message: "", value: "" },
        { id: 7, label: "100", sub: "POINTS", color: "#7c3aed", type: "coins", amount: 100, icon: "coins", name: "100 Points", title: "", message: "", value: "" },
        { id: 8, label: "TRY", sub: "AGAIN", color: "#a855f7", type: "none", amount: 0, icon: "frown", name: "Try Again", title: "", message: "", value: "" },
      ];

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [wonReward, setWonReward] = useState<{ label: string; sub: string; type?: string; amount?: number; title?: string; message?: string; value?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [localLastSpin, setLocalLastSpin] = useState<string | null>(null);

  const p = (profile as any)?.data ?? profile;
  const lastSpinDateStr = localLastSpin || p?.lastSpinDate;
  const cooldownHours = (spinSettingsResponse as any)?.cooldownHours || 2;

  // ── Sync Timer with Last Spin Date from DB ──
  useEffect(() => {
    if (lastSpinDateStr) {
      const calculateSecondsRemaining = () => {
        const lastSpin = new Date(lastSpinDateStr).getTime();
        const diffMs = Date.now() - lastSpin;
        const remSeconds = Math.max(0, Math.ceil((cooldownHours * 3600 * 1000 - diffMs) / 1000));
        setSecondsLeft(remSeconds);
      };

      calculateSecondsRemaining();
      const interval = setInterval(calculateSecondsRemaining, 1000);
      return () => clearInterval(interval);
    } else {
      setSecondsLeft(0);
    }
  }, [lastSpinDateStr, cooldownHours]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return { h, m, s };
  };
  const { h, m, s } = formatTime(secondsLeft);

  const canSpin = secondsLeft <= 0;

  // ── Secure Backend-Driven Spin Logic ──
  const handleSpin = async () => {
    if (isSpinning || !canSpin) return;

    // Immediately kick off the spin animation locally so there is zero latency/pause
    setIsSpinning(true);
    const baseTarget = rotation + 1800; // 5 default spins
    setRotation(baseTarget);

    try {
      // 1. Roll the prize securely on the backend in the background
      const response = await studentApi.claimSpinReward();
      if (!response || !response.success) {
        setIsSpinning(false);
        setRotation(rotation); // Reset rotation to previous state
        return;
      }

      const winnerIndex = response.winnerIndex ?? 0;

      // 2. Calculate target rotation angle matching user UI formula
      const sliceSize = 360 / SEGMENTS.length;
      const targetSliceCenterAngle = (winnerIndex * sliceSize);
      
      const currentRotationOffset = rotation % 360;
      let rotationDelta = (360 - targetSliceCenterAngle) - currentRotationOffset;
      if (rotationDelta < 0) rotationDelta += 360;

      // 3. Update the target angle smoothly mid-flight
      const totalNewRotation = rotation + 1800 + rotationDelta;
      setRotation(totalNewRotation);

      // After animation ends (4.5s matches transition duration), show modal and sync state
      setTimeout(() => {
        setIsSpinning(false);
        setLocalLastSpin(new Date().toISOString());

        setWonReward({
          label: response.reward?.label || SEGMENTS[winnerIndex]?.label || "TRY",
          sub: response.reward?.sub || SEGMENTS[winnerIndex]?.sub || (response.reward?.type || SEGMENTS[winnerIndex]?.type || "AGAIN").toUpperCase(),
          type: response.reward?.type || SEGMENTS[winnerIndex]?.type,
          value: response.reward?.value || "",
          title: response.title,
          message: response.rewardMessage
        });
        setCopied(false);
        setShowRewardModal(true);

        queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["spinSettings"] });
        refetchProfile(); // Refresh balance and start countdown timer
      }, 4500);
    } catch (e) {
      console.error("Spin request failed", e);
      setIsSpinning(false);
      setRotation(rotation); // Reset rotation
    }
  };

  // Dynamic conic-gradient and separator calculations
  const sliceAngle = 360 / SEGMENTS.length;
  const gradientParts = SEGMENTS.map((seg: any, idx: number) => {
    const start = idx * sliceAngle;
    const end = (idx + 1) * sliceAngle;
    return `${seg.color} ${start}deg ${end}deg`;
  });
  const conicGradient = `conic-gradient(from ${-sliceAngle / 2}deg, ${gradientParts.join(', ')})`;

  // Separate white line rotation values
  const separatorLines = [];
  for (let i = 0; i < SEGMENTS.length; i++) {
    const rot = (i * sliceAngle) + (sliceAngle / 2);
    separatorLines.push(
      <div 
        key={i} 
        className="line" 
        style={{ transform: `rotate(${rot}deg)` }}
      />
    );
  }

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-start bg-[#f4f6ff] dark:bg-[#0b081e] px-6 pt-24 pb-6 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic Embedded CSS Styles */}
      <style>{`
        .spinner-wrapper {
          position: relative;
          width: 340px;
          height: 340px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .top-pin {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 38px;
          z-index: 30;
          filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.15));
        }

        .wheel-outer {
          position: relative;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: #ffffff;
          padding: 6px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
          box-sizing: border-box;
        }

        .wheel-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
        }

        .lines-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .line {
          position: absolute;
          top: 0;
          left: 50%;
          width: 3.5px;
          height: 50%;
          background-color: #ffffff;
          transform-origin: bottom center;
        }

        .content-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .slice-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
          transform-origin: bottom center;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #ffffff;
          box-sizing: border-box;
        }

        .slice-text {
          font-weight: 800;
          text-align: center;
          line-height: 1.25;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
          font-family: 'Inter', sans-serif;
        }

        .center-btn-outer {
          position: absolute;
          width: 72px;
          height: 72px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          z-index: 5;
        }

        .center-btn-inner {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: none;
          background: #6140EA;
          color: #ffffff;
          font-weight: 900;
          font-size: 13.5px;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.2), 0 3px 8px rgba(97, 64, 234, 0.4);
          font-family: 'Inter', sans-serif;
        }

        .center-btn-inner:hover:not(:disabled) {
          transform: scale(1.05);
          background: #5031d1;
        }

        .center-btn-inner:active:not(:disabled) {
          transform: scale(0.95);
        }

        .center-btn-inner:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute top-[10%] left-[-10%] h-64 w-64 bg-violet-600/5 dark:bg-cyan-500/10 blur-[100px]" />

      {/* ── HEADER ── */}
      <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 max-w-sm mx-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(PATHS.STUDENT_DASHBOARD)}
          className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="text-center flex-1 pr-10">
          <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">VLM Academy</h1>
          <p className="text-[9px] tracking-wider text-slate-400 dark:text-slate-500 font-bold mt-0.5 uppercase">Learn Without Limits</p>
        </div>
      </header>

      {/* ── CENTERED CONTENT AREA ── */}
      <div className="flex-1 w-full max-w-sm flex flex-col justify-center items-center gap-6 z-10 mt-6">
        
        {/* ── THE WHEEL WRAPPER ── */}
        <div className="spinner-wrapper">
          {/* Top Pin Marker */}
          <svg className="top-pin" viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg">
            <path d="M30,0 C13.431,0 0,13.431 0,30 C0,51.105 27.75,82.2 28.95,83.7 C29.49,84.405 30.51,84.405 31.05,83.7 C32.25,82.2 60,51.105 60,30 C60,13.431 46.569,0 30,0 Z" fill="#6140EA" />
            <circle cx="30" cy="27" r="9" fill="white" />
          </svg>

          {/* Wheel Outer Body */}
          <div className="wheel-outer">
            <div 
              className="wheel-inner"
              style={{
                background: conicGradient,
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
              }}
            >
              {/* White Separator Lines */}
              <div className="lines-container">
                {separatorLines}
              </div>

              {/* Slices Content */}
              <div className="content-container">
                {SEGMENTS.map((seg: any, i: number) => {
                  const rot = i * sliceAngle;
                  const isManySegments = SEGMENTS.length > 6;
                  return (
                    <div 
                      key={seg.id || i} 
                      className="slice-content" 
                      style={{ 
                        transform: `rotate(${rot}deg)`,
                        paddingTop: isManySegments ? '22px' : '28px'
                      }}
                    >
                      {/* Render Icon */}
                      <div style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))', marginBottom: '4px' }}>
                        {renderSegmentIcon(seg.icon || "", seg.label, seg.sub, isManySegments ? 22 : 28)}
                      </div>
                      {/* Render Label */}
                      <div 
                        className="slice-text" 
                        style={{ 
                          fontSize: isManySegments ? '9px' : '10.5px', 
                          maxWidth: isManySegments ? '68px' : '82px' 
                        }}
                      >
                        {seg.name ? seg.name.split(' ').map((word: string, wIdx: number) => (
                          <div key={wIdx}>{word}</div>
                        )) : (
                          <>
                            <div>{seg.label}</div>
                            <div>{seg.sub}</div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center SPIN Button */}
          <div className="center-btn-outer">
            <button 
              className="center-btn-inner" 
              onClick={handleSpin}
              disabled={!canSpin || isSpinning}
            >
              SPIN
            </button>
          </div>
        </div>

        {/* ── SPIN NOW ALTERNATE ACTION BUTTON ── */}
        <div className="w-full relative mt-2">
          <div className="absolute inset-0 bg-violet-600/10 dark:bg-violet-600/20 blur-3xl rounded-full" />
          <Button
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
            className={`relative w-full h-14 rounded-full text-base font-black tracking-widest transition-all active:scale-95 text-white border-none shadow-[0_4px_25px_rgba(109,40,217,0.4)] ${canSpin
              ? "bg-[#6140EA] hover:bg-[#5031d1]"
              : "bg-gradient-to-b from-neutral-850 to-neutral-950 cursor-not-allowed opacity-60 shadow-none"
              }`}
          >
            <div className="flex flex-col">
              <span className="leading-none tracking-[0.1em]">
                {!canSpin ? "SPIN TODAY" : "SPIN NOW"}
              </span>
              <span className="text-[9px] font-medium opacity-50 tracking-normal mt-1 italic capitalize">
                {!canSpin ? "Come back tomorrow!" : "Daily free spin!"}
              </span>
            </div>
          </Button>
        </div>

        {/* ── TIMER CARD ── */}
        {!canSpin && (
          <Card className="w-full border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm rounded-3xl py-3">
            <CardContent className="flex flex-col items-center space-y-4 p-0">
              <div className="text-center space-y-0.5">
                <h3 className="text-[11px] font-black tracking-[0.2em] text-slate-800 dark:text-slate-100">DAILY REWARDS</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">Next free spin in:</p>
              </div>

              <div className="flex items-center gap-3">
                <TimerBox value={h} />
                <span className="text-slate-350 dark:text-slate-655 font-bold">:</span>
                <TimerBox value={m} />
                <span className="text-slate-350 dark:text-slate-655 font-bold">:</span>
                <TimerBox value={s} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── CUSTOM REWARD POPUP ── */}
      <AnimatePresence>
        {showRewardModal && wonReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-[20px] bg-white dark:bg-slate-900 p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col items-center gap-6"
            >
              {/* Top party popper emoji */}
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner">
                {wonReward.label === "TRY" || wonReward.title?.toUpperCase().includes("TRY") || wonReward.title?.toUpperCase().includes("LUCK") ? "😢" : "🎉"}
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-800 dark:text-white font-sans tracking-tight">
                  {wonReward.title || (wonReward.label === "TRY" ? "TRY AGAIN!" : "CONGRATULATIONS!")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed px-2">
                  {wonReward.message || (wonReward.label === "TRY"
                    ? "Better luck next time! Your daily spin has been used."
                    : `You just won ${wonReward.label} ${wonReward.sub}!`)}
                </p>
              </div>

              {/* Reward Block */}
              <div className="py-3 px-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 w-full shadow-inner">
                <span className="text-3xl font-black text-slate-850 dark:text-white tracking-tight block">
                  {wonReward.label}
                </span>
                <span className="text-xs font-bold tracking-[0.15em] text-[#6140EA] dark:text-violet-400 uppercase mt-0.5 block">
                  {wonReward.sub}
                </span>
              </div>

              {wonReward.type === "coupon" && wonReward.value && (
                <div className="w-full flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-left">
                    Your Coupon Code
                  </span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-violet-600/5 border border-violet-500/20 w-full">
                    <code className="text-sm font-black text-[#6140EA] dark:text-violet-400 font-mono select-all">
                      {wonReward.value}
                    </code>
                    <button
                      onClick={() => {
                        if (wonReward.value) {
                          navigator.clipboard.writeText(wonReward.value);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#6140EA] hover:bg-[#5031d1] text-white transition-all active:scale-95 cursor-pointer border-none"
                    >
                      {copied ? "Copied! ✓" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowRewardModal(false)}
                className="w-full h-11 rounded-full font-bold text-sm bg-[#6140EA] hover:bg-[#5031d1] text-white border-none shadow-[0_4px_10px_rgba(97,64,234,0.3)] active:scale-95 transition-all cursor-pointer"
              >
                Claim Reward
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimerBox({ value }: { value: string }) {
  return (
    <div className="h-10 w-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm">
      <span className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono tabular-nums">{value}</span>
    </div>
  );
}