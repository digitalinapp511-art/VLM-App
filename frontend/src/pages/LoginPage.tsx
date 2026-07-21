import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { VlmWordmark } from "@/components/basic/VlmWordMark";
import logoImg from "../assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { useGoogleAuth, useSendOtp } from "@/hooks/use-auth";
import { PATHS } from "@/routes/paths";
import { toast } from "sonner";

const Container = ({ children, className }: any) => <div className={cn("relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden p-3 md:p-4", className)}>{children}</div>;
const Stack = ({ children, className }: any) => <div className={cn("flex flex-col", className)}>{children}</div>;
const Grid = ({ children, className }: any) => <div className={cn("grid w-full", className)}>{children}</div>;

const Typography = ({ variant, children, className }: any) => {
  const styles: any = {
    h1: "text-5xl font-black tracking-tight xl:text-6xl text-white",
    h2: "text-2xl sm:text-3xl text-white",
    h3: "text-xl   text-white",
    p: "text-sm sm:text-base text-white/50 leading-relaxed",
    small: "text-[10px] font-bold tracking-[0.2em] uppercase text-white/30",
  };
  const Tag = variant === "p" ? "p" : variant === "small" ? "span" : variant;
  return <Tag className={cn(styles[variant], className)}>{children}</Tag>;
};

const DECORATIONS = [
  { icon: "📖", pos: "top-[12%] left-[8%]", size: "text-2xl", delay: "delay-0" },
  { icon: "🎓", pos: "top-[10%] right-[10%]", size: "text-xl", delay: "delay-150" },
  { icon: "💡", pos: "top-[38%] left-[4%]", size: "text-lg", delay: "delay-300" },
  { icon: "⚙️", pos: "top-[18%] right-[6%]", size: "text-lg", delay: "delay-500" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { role: urlRole } = useParams<{ role: string }>();
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const role = (urlRole ?? localStorage.getItem("vlm_role") ?? sessionStorage.getItem("vlm_role") ?? "student") as import("@/types").Role;
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vlm_token");
    const activeRole = urlRole || localStorage.getItem("vlm_role") || sessionStorage.getItem("vlm_role") || "student";

    if (token && activeRole) {
      if (activeRole === "student") {
        navigate(PATHS.STUDENT_DASHBOARD, { replace: true });
        return;
      } else if (activeRole === "teacher") {
        navigate(PATHS.TEACHER_DASHBOARD, { replace: true });
        return;
      }
    }

    if (["student", "teacher", "parent"].includes(activeRole)) {
      localStorage.setItem("vlm_role", activeRole);
      if (activeRole === "student") {
        localStorage.setItem("vlm_student_theme", "light");
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      }
    }
  }, [urlRole, navigate]);


  const loginMutation = useSendOtp();
  const googleMutation = useGoogleAuth();

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const onSubmit = async () => {
    const emailVal = (emailRef.current?.value || email).trim();
    const phoneVal = (phoneRef.current?.value || phone).trim();

    if (!phoneVal && !emailVal) {
      toast.error("Please enter your Phone Number or Email Address");
      return;
    }

    let identifier = "";

    if (phoneVal) {
      const phoneRegex = /^[5-9]\d{9}$/;
      if (!phoneRegex.test(phoneVal)) {
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }
      identifier = phoneVal;
    } else if (emailVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        toast.error("Please enter a valid email address");
        return;
      }
      identifier = emailVal;
    }

    sessionStorage.setItem("vlm_email", identifier);
    sessionStorage.setItem("vlm_auth_email", identifier);
    localStorage.setItem("vlm_role", role);

    loginMutation.mutate(
      { email: identifier, purpose: "login", role },
      {
        onSuccess: (data: any) => {
          const receivedOtp = data?.otp || data?.code || data?.data?.otp || data?.data?.code;
          if (receivedOtp) {
            sessionStorage.setItem("vlm_sent_otp", String(receivedOtp));
          } else {
            sessionStorage.removeItem("vlm_sent_otp");
          }
          navigate(PATHS.OTP, { state: { role, email: identifier } });
        },
      }
    );
  };

  if (role === "student") {
    return (
      <div className="relative flex min-h-svh w-full flex-col items-center justify-center bg-[#f4f6ff] text-slate-800 p-4 overflow-hidden">
        {/* Subtle radial glow accents */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/5 blur-[100px] -z-10" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-650/5 blur-[100px] -z-10" />

        {/* Content Box */}
        <div className="w-full max-w-sm flex flex-col items-center z-10 space-y-6">

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="h-14 w-auto flex items-center justify-center">
              <img src={logoImg} alt="VLM Academy" className="h-12 w-auto" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800 mt-3">Welcome Back Student!</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VLM Digital Academy</p>
          </div>

          {/* Login Card */}
          <div className="w-full bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">
              Login with OTP
            </h2>

            {/* Mobile input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Phone Number</label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-violet-500/50 transition-all px-3">
                <span className="text-xs font-bold text-slate-400 mr-2 border-r border-slate-250 pr-2">+91</span>
                <input
                  type="tel"
                  ref={phoneRef}
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="bg-transparent h-12 w-full text-xs text-slate-800 placeholder:text-slate-455 border-none outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-between text-slate-300">
              <div className="h-[1px] flex-1 bg-slate-200" />
              <span className="text-[8px] font-black tracking-widest px-3 uppercase text-slate-400">OR EMAIL</span>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>

            {/* Email input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Email Address</label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-violet-500/50 transition-all px-3">
                <input
                  type="text"
                  placeholder="Enter Email Address"
                  ref={emailRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent h-12 w-full text-xs text-slate-800 placeholder:text-slate-455 border-none outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={onSubmit}
              disabled={loginMutation.isPending}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2 border-none"
            >
              {loginMutation.isPending ? "Sending OTP..." : "Get OTP Verification"}
            </Button>
          </div>


        </div>
      </div>
    );
  }

  return (
    <Container className="vlm-bg-navy">
      {/* Background Decor Components */}
      {DECORATIONS.map((d, i) => (
        <Badge
          key={i}
          variant="ghost"
          className={cn("absolute border-none pointer-events-none opacity-30 animate-in fade-in zoom-in duration-1000", d.pos, d.size, d.delay)}
        >
          {d.icon}
        </Badge>
      ))}

      <Grid className="relative z-10 max-w-6xl lg:grid-cols-2 lg:px-10 gap-10">

        {/* LEFT PANEL */}
        <Stack className="hidden lg:flex gap-20 animate-in slide-in-from-left duration-700">
          <VlmWordmark role={roleLabel} />
          <Stack className="gap-4">
            <Typography variant="h1">
              Welcome Back,<br />
              <span className="vlm-gold-text">{roleLabel}!</span>
            </Typography>
            <Typography variant="p" className="max-w-md">
              Access your personalized learning dashboard, track progress, and manage your academic journey.
            </Typography>
          </Stack>
          <Star className="vlm-gold-text fill-current" size={40} strokeWidth={0} />
        </Stack>

        {/* RIGHT PANEL */}
        <Stack className="items-center justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Stack className="mb-4 sm:mb-8 lg:hidden items-center">
            <VlmWordmark role={roleLabel} center />
            <Typography variant="h2" className="mt-2 sm:mt-4 text-center">Welcome Back!</Typography>
          </Stack>

          <Card className="w-full max-w-md border-[#333] bg-taupe-100/5 backdrop-blur-xl shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-t-white/10">
            <CardHeader className="pt-6 pb-3 sm:pt-10 sm:pb-6 text-center">
              <CardTitle className="text-base sm:text-xl font-bold text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                Login with Mobile OTP
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 px-6 pb-6 sm:px-8 sm:pb-10">
              {/* Phone Input Box */}
              <Stack className="gap-2">
                <div className="relative flex p-1.5 sm:p-2 overflow-hidden rounded-xl sm:rounded-2xl border border-[#555] bg-[#444]/40 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                  <div className="flex items-center gap-1.5 sm:gap-2 border-r border-[#555] px-3 sm:px-4 text-white">
                    <span className="text-base sm:text-lg">🇮🇳</span>
                    <span className="font-medium text-xs sm:font-medium sm:text-white/90 text-white/90">+91</span>
                  </div>
                  <Input
                    type="tel"
                    ref={phoneRef}
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="h-10 sm:h-full border-none text-sm sm:text-lg text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </Stack>

              {/* Divider Section */}
              <div className="relative flex items-center justify-center py-1 sm:py-2">
                <div className="h-[1px] flex-1 bg-white/20" />
                <span className="px-3 text-[9px] sm:text-[10px] font-black tracking-[0.2em] text-white/80 uppercase">
                  OR LOGIN WITH
                </span>
                <div className="h-[1px] flex-1 bg-white/20" />
              </div>

              {/* Email Form */}
              <div className="space-y-3 sm:space-y-4">
                <Input
                  type="text"
                  placeholder="Email Address"
                  required
                  ref={emailRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl sm:rounded-2xl border-[#555] bg-[#444]/40 p-4 sm:p-6 h-11 sm:h-14 text-sm sm:text-base text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                />

                {/* Login Button with Glow Effect */}
                <div className="relative pt-1 sm:pt-2">
                  {/* External Glow Layer */}
                  <div className="absolute inset-x-0 bottom-0 top-1 sm:top-2 bg-blue-600/30 blur-xl rounded-xl" />

                  <Button
                    type="button"
                    onClick={onSubmit}
                    className="relative text-white w-full h-12 sm:h-16 rounded-xl sm:rounded-2xl text-sm sm:text-lg tracking-wide border border-blue-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] hover:brightness-110"
                    style={{ background: "linear-gradient(180deg, #1e3a8e 0%, #0f172a 100%)" }}
                  >
                    Login to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>


        </Stack>
      </Grid>
    </Container>
  );
}