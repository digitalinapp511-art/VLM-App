import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Upload, Video, Calendar, ShieldCheck } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

import { PATHS } from "@/routes/paths";
import IllustrationCard from "@/components/basic/teacher/IllustrationCard";
import RegistrationStepCard from "@/components/basic/teacher/RegistrationStepCard";
import RegistrationButton from "@/components/basic/teacher/RegistrationButton";

const TeacherRegistration: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => navigate(PATHS.QUALIFICATION_DETAILS);

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-6", bgCss)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-[380px] p-5 rounded-[32px] border border-white/10",
          "bg-white/[0.03] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        )}
      >
        {/* Subdued glow effect inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] -z-10" />

        <header className="text-center mb-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome, Educator!
          </h1>
        </header>

        <IllustrationCard />

        <section className="text-center px-2 mb-6">
          <p className="text-zinc-400 text-[13px] leading-relaxed">
            Start your journey as an online teacher with <br />
            VLM Academy. Let's get you registered.
          </p>
        </section>

        <div className="space-y-2.5 mb-6">
          <RegistrationStepCard
            icon={<User />}
            title="1. Profile Setup"
            description="Basic Info & Qualifications"
            iconColor="bg-blue-500/20"
          />
          <RegistrationStepCard
            icon={<Upload />}
            title="2. Document Upload"
            description="Verify ID & Degrees"
            iconColor="bg-emerald-500/20"
          />
          <RegistrationStepCard
            icon={<Video />}
            title="3. Demo Video"
            description="5-minute Lesson"
            iconColor="bg-rose-500/20"
          />
          <RegistrationStepCard
            icon={<Calendar />}
            title="4. Interview"
            description="Discuss Your Expertise"
            iconColor="bg-purple-500/20"
          />
          <RegistrationStepCard
            icon={<ShieldCheck />}
            title="5. Approval"
            description="Join Our Faculty"
            iconColor="bg-zinc-100/10"
          />
        </div>

        <RegistrationButton onClick={handleStart} />
      </motion.div>
    </div>
  );
};

export default TeacherRegistration;