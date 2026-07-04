import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {  Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { VlmWordmark } from "@/components/basic/VlmWordMark";
// --- SHADCN UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { useGoogleAuth, useSendOtp } from "@/hooks/use-auth";
import { PATHS } from "@/routes/paths";

// --- CUSTOM WRAPPERS (To replace raw HTML) ---
const Container = ({ children, className }: any) => <div className={cn("relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden p-3 md:p-4", className)}>{children}</div>;
const Stack = ({ children, className }: any) => <div className={cn("flex flex-col", className)}>{children}</div>;
// const Row = ({ children, className }: any) => <div className={cn("flex items-center", className)}>{children}</div>;
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
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const role = (sessionStorage.getItem("vlm_role") ?? "teacher") as import("@/types").Role;
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useSendOtp();
  const googleMutation = useGoogleAuth();

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const onSubmit = async () => {
    const emailVal = emailRef.current?.value || email;
    const phoneVal = phoneRef.current?.value || phone;
    const identifier = emailVal || phoneVal;
    
    if (!identifier) return;

    sessionStorage.setItem("vlm_email", identifier);
    sessionStorage.setItem("vlm_auth_email", identifier);
    sessionStorage.setItem("vlm_role", role);

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

          {/* SOCIAL LOGIN */}
          <Stack className="mt-4 sm:mt-6 w-full max-w-md px-4 gap-3 sm:gap-4">
            <Typography variant="p" className="text-center text-xs sm:text-sm">
              New here?{" "}
              <Button variant="link" className="h-auto p-0 text-white/60 font-bold underline underline-offset-4 text-xs sm:text-sm">
                Request Portal Access ⊕
              </Button>
            </Typography>
          </Stack>
        </Stack>
      </Grid>
    </Container>
  );
}