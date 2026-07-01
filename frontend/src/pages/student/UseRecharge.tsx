import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronLeft, CheckCircle, Smartphone, Ticket, Copy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentProfile } from "@/hooks/use-student";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { GoldCoinsIcon } from "@/components/basic/GoldCoinsIcon";

type Voucher = {
  id: string;
  title: string;
  cost: number;
  type: "data" | "voucher";
  desc: string;
  provider: string;
  logoColor: string;
};

export default function UseRecharge() {
  const navigate = useNavigate();
  const { data: profile, refetch } = useStudentProfile();
  const p = (profile as any)?.data ?? profile;

  const [points, setPoints] = useState(p?.totalPoints ?? p?.wallet?.totalPoints ?? 100);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<Voucher | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const vouchersList: Voucher[] = [
    {
      id: "data-1",
      title: "1.5 GB Data Top-up",
      cost: 150,
      type: "data",
      desc: "Instant 4G high-speed data voucher valid for 24 hours.",
      provider: "Jio / Airtel / Vi",
      logoColor: "bg-blue-500/10 border-blue-500/20 text-blue-400"
    },
    {
      id: "talk-1",
      title: "₹50 Talktime Top-up",
      cost: 400,
      type: "data",
      desc: "Instant standard main balance recharge top-up.",
      provider: "All Major Telecom Providers",
      logoColor: "bg-amber-500/10 border-amber-500/20 text-amber-400"
    },
    {
      id: "talk-2",
      title: "₹100 Talktime Top-up",
      cost: 800,
      type: "data",
      desc: "Instant talktime top-up credited to your mobile number.",
      provider: "All Major Telecom Providers",
      logoColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      id: "amazon-1",
      title: "₹100 Amazon Gift Card",
      cost: 1000,
      type: "voucher",
      desc: "Add to Amazon Pay balance for shopping or bill payments.",
      provider: "Amazon India",
      logoColor: "bg-orange-500/10 border-orange-500/20 text-orange-400"
    },
    {
      id: "bms-1",
      title: "₹250 BookMyShow Voucher",
      cost: 2200,
      type: "voucher",
      desc: "Redeem on BookMyShow app to book movies, events or plays.",
      provider: "BookMyShow",
      logoColor: "bg-pink-500/10 border-pink-500/20 text-pink-400"
    }
  ];

  const handleRedeem = (voucher: Voucher) => {
    if (points < voucher.cost) {
      setErrorMsg(`You need ${voucher.cost - points} more PTS to redeem this top-up! Complete MCQs or spin the wheel to earn more.`);
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }
    setPoints(prev => prev - voucher.cost);
    setRedeemedVoucher(voucher);
    // Generate a random mock coupon code
    const randCode = "VLM-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setRedeemedCode(randCode);
  };

  const copyToClipboard = () => {
    if (redeemedCode) {
      navigator.clipboard.writeText(redeemedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("min-h-svh w-full text-white flex flex-col px-6 pb-20 overflow-x-hidden relative", bgCss)}>
      
      {/* Background Decor */}
      <div className="absolute top-[8%] left-[-10%] h-64 w-64 bg-cyan-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-64 w-64 bg-amber-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between pt-8 pb-1 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white shrink-0 active:scale-95 transition-all" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </Button>
          
          <h1 className="text-sm font-black tracking-widest text-white/90 uppercase">
            Redeem Recharges
          </h1>
          <div className="w-10" />
        </header>

        {/* ── WALLET POINTS BALANCE DISPLAY ── */}
        <Card className="border border-cyan-500/20 bg-[#1a1a1a]/40 backdrop-blur-xl rounded-[2rem] p-6 text-center">
          <span className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase block">
            AVAILABLE REDEMPTION BALANCE
          </span>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-3xl font-black text-white font-sans tracking-tight">
              {points.toLocaleString()}
            </span>
            <span className="text-xs font-black text-white/70 tracking-widest mt-1.5 uppercase">
              PTS
            </span>
            <GoldCoinsIcon size={18} className="mt-0.5" />
          </div>
        </Card>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in duration-300">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-red-300 leading-snug text-left">{errorMsg}</p>
          </div>
        )}

        {/* ── VOUCHERS LIST ── */}
        <main className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {vouchersList.map((item) => (
            <Card 
              key={item.id}
              className="bg-[#1a1a1a]/40 border border-white/5 rounded-[1.8rem] overflow-hidden p-5 transition-all hover:bg-white/[0.02]"
            >
              <CardContent className="p-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left">
                  <div className={cn("h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0", item.logoColor)}>
                    {item.type === "data" ? <Smartphone size={20} /> : <Ticket size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-white/40 block mt-0.5 uppercase tracking-wide">
                      {item.provider}
                    </span>
                    <p className="text-[10px] text-white/40 leading-snug mt-1 max-w-[200px]">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5 shrink-0">
                  <div className="flex items-center gap-1">
                    <GoldCoinsIcon size={12} />
                    <span className="text-xs font-black text-white">
                      {item.cost} PTS
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRedeem(item)}
                    className={cn(
                      "h-8 px-4 rounded-full font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-md",
                      points >= item.cost
                        ? "bg-cyan-400 text-black hover:bg-cyan-300"
                        : "bg-neutral-800 text-white/30 border border-white/5 cursor-not-allowed hover:bg-neutral-800"
                    )}
                  >
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>

      {/* ── REDEMPTION SUCCESS DIALOG ── */}
      {redeemedCode && redeemedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg p-6">
          <div className="relative w-full max-w-xs rounded-[2.5rem] border border-cyan-500/30 bg-black/50 backdrop-blur-2xl p-8 text-center shadow-[0_0_40px_rgba(34,211,238,0.15)] flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400 border border-cyan-500/20 text-2xl shadow-inner">
              <CheckCircle size={32} className="text-cyan-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white leading-snug">
                Redeemed Successfully!
              </h3>
              <p className="text-xs text-white/55 leading-snug">
                You have redeemed <strong className="text-white">{redeemedVoucher.title}</strong>. Your coupon code is:
              </p>
            </div>

            {/* Code Copy Box */}
            <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-xs font-mono font-bold text-cyan-400 select-all">
                {redeemedCode}
              </span>
              <button 
                onClick={copyToClipboard}
                className="text-white/40 hover:text-cyan-400 transition-colors active:scale-90"
              >
                <Copy size={16} />
              </button>
            </div>
            
            {copied && (
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest -mt-4 animate-pulse">
                Copied to Clipboard!
              </span>
            )}

            <Button
              onClick={() => {
                setRedeemedCode(null);
                setRedeemedVoucher(null);
                refetch(); // sync points balance
                navigate(PATHS.STUDENT_DASHBOARD);
              }}
              className="w-full h-12 rounded-full font-bold text-sm bg-cyan-400 text-black hover:bg-cyan-300 transition-all uppercase tracking-wider"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
