import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { LoginInput, LoginDivider } from "@/components/basic/teacher/LoginComponents";
import OTPField from "@/components/basic/teacher/OTPField";

const TeacherLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("min-h-screen flex flex-col items-center bg-black p-4 md:p-8", bgCss)}>
      {/* App Logo/Name */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-10 text-center"
      >
        <h1 className="text-3xl font-black text-white tracking-tight">VLM Academy</h1>
      </motion.header>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={cn(
          "w-full max-w-xl p-8 md:p-10 rounded-[44px] border border-white/5",
          "bg-zinc-900/60 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
        )}
      >
        {/* Decorative background moons/glows */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-zinc-400/5 blur-3xl rounded-full" />
        <div className="absolute top-40 -right-10 w-32 h-32 bg-zinc-400/5 blur-3xl rounded-full" />

        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Welcome Back, Teacher!
          </h2>
          <p className="text-zinc-500 font-medium">Log in to your portal.</p>
        </div>

        <div className="space-y-6">
          {/* Phone Section */}
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-zinc-800">
                <span className="text-sm font-bold text-zinc-300">+91</span>
                <ChevronDown size={14} className="text-zinc-600" />
              </div>
              <div className="absolute left-[72px] top-1/2 -translate-y-1/2 text-zinc-500">
                <Phone size={18} strokeWidth={1.5} />
              </div>
              <input
                type="tel"
                placeholder="Mobile Number"
                className="w-full h-14 pl-[105px] pr-6 rounded-2xl border border-white/10 bg-zinc-900/40 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            <Button className="w-full h-14 rounded-2xl bg-transparent border border-blue-500/50 text-blue-400 hover:bg-blue-500/5 font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.15)]">
              Get OTP
            </Button>
          </div>

          <OTPField />

          <Button className="w-full h-14 rounded-full border border-purple-500/40 bg-zinc-950/60 text-white font-black uppercase tracking-widest hover:bg-zinc-900 shadow-xl">
            Verify & Login
          </Button>

          <LoginDivider text="or log in with" />

          {/* Email Section */}
          <div className="space-y-3">
            <LoginInput icon={Mail} placeholder="Email Address" />
            <div className="space-y-1">
              <LoginInput 
                icon={Lock} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                rightElement={
                  <button onClick={() => setShowPassword(!showPassword)} className="p-1 hover:text-zinc-300">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <div className="flex justify-end pr-2">
                <button className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight hover:text-zinc-300">
                  Forgot Password?
                </button>
              </div>
            </div>
            
            <Button className="w-full h-14 rounded-full border border-purple-500/40 bg-zinc-900/80 text-zinc-200 font-black uppercase tracking-widest hover:bg-zinc-800 shadow-lg">
              Login with Email
            </Button>
          </div>

          <LoginDivider text="or sign in with" />

          {/* Social Section */}
          <Button variant="outline" className="w-full h-14 rounded-full border border-purple-500/40 bg-transparent text-zinc-200 font-bold gap-3 hover:bg-white/5">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </Button>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center space-y-6">
          <p className="text-[13px] font-medium text-zinc-400">
            New to VLM? <button className="text-cyan-400 font-bold underline underline-offset-4">Create an Account</button>
          </p>
          <div className="flex justify-center gap-6 text-[12px] font-bold text-cyan-400/80">
            <button className="hover:text-cyan-300 underline">Privacy Policy</button>
            <button className="hover:text-cyan-300 underline">Terms of Service</button>
          </div>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
            © 2024 VLM Academy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherLogin;