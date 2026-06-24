import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { 
  User, 
  VenusAndMars, 
  Calendar, 
  MapPin, 
  Mail, 
  Smartphone,
  ChevronRight
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";
import ProfilePhotoUpload from "@/components/basic/teacher/ProfilePhotoUpload";
import RegistrationInputField from "@/components/RegistrationInputField";

const TeacherBasicDetails: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-10", bgCss)}>
      {/* Stepper Header */}
      <RegistrationStepper currentStep={1} />

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-xl p-6 rounded-[40px] border border-white/10",
          "bg-[#121212]/90 backdrop-blur-2xl shadow-2xl relative"
        )}
      >
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Basic Profile Details <span className="text-zinc-400 text-lg font-normal">(Step 1 of 5)</span>
          </h1>
          <p className="text-zinc-500 text-sm">Complete your personal details.</p>
        </header>

        <div className="space-y-4">
          {/* Top Section: Photo + Name/Gender/DOB */}
          <div className="flex gap-4">
            <ProfilePhotoUpload />
            
            <div className="flex-1 space-y-3">
              <RegistrationInputField 
                icon={<User />} 
                label="Full Name" 
                placeholder="Enter Full Name" 
              />
              <RegistrationInputField 
                icon={<VenusAndMars />} 
                label="Gender" 
                placeholder="Select Gender" 
                isSelect 
                iconColor="text-rose-400"
              />
              <RegistrationInputField 
                icon={<Calendar />} 
                label="DOB" 
                placeholder="DD / MM / YYYY" 
              />
            </div>
          </div>

          {/* Full Width Address */}
          <RegistrationInputField 
            icon={<MapPin />} 
            label="Address" 
            placeholder="Enter Street Address" 
          />

          {/* Grid: City/State + Pincode */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 p-4 rounded-[22px] border border-white/10 bg-white/[0.03] space-y-2">
              <div className="flex items-center gap-4">
                <MapPin size={20} className="text-blue-400" />
                <div className="flex-1">
                   <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-zinc-100">City / State</span>
                        <span className="text-[13px] text-zinc-500">City</span>
                      </div>
                      <ChevronDown size={14} className="text-zinc-500" />
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[13px] text-zinc-500">State</span>
                      <ChevronDown size={14} className="text-zinc-500" />
                   </div>
                </div>
              </div>
            </div>

            <RegistrationInputField 
              className="col-span-2"
              icon={<MapPin />} 
              label="Pincode" 
              placeholder="XXXXXX" 
            />
          </div>

          {/* Contact Fields */}
          <RegistrationInputField 
            icon={<Mail />} 
            label="Email" 
            value="Pearl@gmail.com" 
          />

          <RegistrationInputField 
            icon={<Smartphone />} 
            label="Mobile" 
            value="9797979797" 
            iconColor="text-blue-300"
          />
        </div>

        {/* Footer Action */}
        <div className="mt-8">
          <Button 
            onClick={() => navigate("/teacher/register/step-2")}
            className={cn(
              "w-full h-14 rounded-full text-lg font-semibold transition-all",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-white/10 shadow-xl text-white flex items-center justify-center gap-2"
            )}
          >
            Continue to document <ChevronRight size={20} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherBasicDetails;