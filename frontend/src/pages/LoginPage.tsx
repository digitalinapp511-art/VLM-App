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
const Container = ({ children, className }: any) => <div className={cn("relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden p-4", className)}>{children}</div>;
const Stack = ({ children, className }: any) => <div className={cn("flex flex-col", className)}>{children}</div>;
// const Row = ({ children, className }: any) => <div className={cn("flex items-center", className)}>{children}</div>;
const Grid = ({ children, className }: any) => <div className={cn("grid w-full", className)}>{children}</div>;

const Typography = ({ variant, children, className }: any) => {
  const styles: any = {
    h1: "text-5xl font-black tracking-tight xl:text-6xl text-white",
    h2: "text-3xl  text-white",
    h3: "text-xl   text-white",
    p: "text-base text-white/50 leading-relaxed",
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
      { email: identifier, purpose: "login" },
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
          <Stack className="mb-8 lg:hidden items-center">
            <VlmWordmark role={roleLabel} center />
            <Typography variant="h2" className="mt-4">Welcome Back!</Typography>
          </Stack>

          <Card className="w-full max-w-md border-[#333] bg-taupe-100/5 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden border-t-white/10">
            <CardHeader className="pt-10 pb-6 text-center">
              <CardTitle className="text-xl font-bold text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                Login with Mobile OTP
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pb-10">
              {/* Phone Input Box */}
              <Stack className="gap-2">
                <div className="relative flex p-2 overflow-hidden rounded-2xl border border-[#555] bg-[#444]/40 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                  <div className="flex items-center gap-2 border-r border-[#555] px-4 text-white">
                    <span className="text-lg">🇮🇳</span>
                    <span className="font-medium text-white/90">+91</span>
                  </div>
                  <Input
                    type="tel"
                    ref={phoneRef}
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="h-full border-none  text-lg text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </Stack>

              {/* Divider Section */}
              <div className="relative flex items-center justify-center py-2">
                <div className="h-[1px] flex-1 bg-white/20" />
                <span className="px-4 text-[10px] font-black tracking-[0.2em] text-white/80 uppercase">
                  OR LOGIN WITH
                </span>
                <div className="h-[1px] flex-1 bg-white/20" />
              </div>

              {/* Email Form */}
              {/* <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate('/otp')
        loginMutation.mutate({ email });
      }}
      className="space-y-4"
    > */}
              <div className="space-y-4">

                <Input
                  type="text"
                  placeholder="Email Address"
                  required
                  ref={emailRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className=" rounded-2xl border-[#555] bg-[#444]/40 p-6 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                />

                {/* <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className=" rounded-2xl border-[#555] bg-[#444]/40 p-6 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500/50 pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:bg-transparent hover:text-white"
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </Button>
      </div> */}

                {/* Forgot Password Link */}
                {/* <div className="flex justify-end">
        <Button
          variant="link"
          className="h-auto p-0 text-xs text-white/40 underline underline-offset-4 hover:text-white/60 font-normal"
        >
          Forgot Password?
        </Button>
      </div> */}

                {/* Login Button with Glow Effect */}
                <div className="relative pt-2">
                  {/* External Glow Layer */}
                  <div className="absolute inset-x-0 bottom-0 top-2 bg-blue-600/30 blur-2xl rounded-2xl" />

                  <Button
                    type="button"
                    onClick={onSubmit}
                    className="relative text-white w-full h-16 rounded-2xl text-lg tracking-wide border border-blue-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] hover:brightness-110"
                    style={{ background: "linear-gradient(180deg, #1e3a8e 0%, #0f172a 100%)" }}
                  >
                    Login to Dashboard
                  </Button>
                </div>

                {/* Temp Bypass Button for Development */}
                {!import.meta.env.PROD && (
                  <Button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("vlm_token", "dev-bypass-token");
                      localStorage.setItem("dev_bypass_auth", "true");
                      sessionStorage.setItem("vlm_role", role);
                      if (role === "teacher") navigate(PATHS.TEACHER_DASHBOARD);
                      else if (role === "parent") navigate(PATHS.PARENT_DASHBOARD);
                      else navigate(PATHS.STUDENT_DASHBOARD);
                    }}
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-dashed border-amber-500/50 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
                  >
                    Bypass Login (Dev Mode)
                  </Button>
                )}
              </div>

              {/* </form> */}
            </CardContent>
          </Card>

          {/* SOCIAL LOGIN */}
          <Stack className="mt-6 w-full max-w-md px-4 gap-4">
            <Button
              variant="outline"
              onClick={() => googleMutation.mutate()}
              className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <GoogleIcon /> Continue with Google
            </Button>

            <Typography variant="p" className="text-center text-sm">
              New here?{" "}
              <Button variant="link" className="h-auto p-0 text-white/60 font-bold underline underline-offset-4">
                Request Portal Access ⊕
              </Button>
            </Typography>
          </Stack>
        </Stack>
      </Grid>
    </Container>
  );
}

// --- SUB-COMPONENTS ---


function GoogleIcon() {
  return (
    <svg className="mr-3 h-5 w-5" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}