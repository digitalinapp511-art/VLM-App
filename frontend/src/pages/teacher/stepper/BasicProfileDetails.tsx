


import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, VenusAndMars, Calendar, MapPin, Mail, Smartphone, Camera, ChevronRight
} from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import RegistrationStepper from "@/components/basic/teacher/RegistrationStepper";
import RegistrationField from "@/components/basic/teacher/RegistrationField";

const BasicProfileDetails: React.FC = () => {
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
    retry: false,
  });

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        gender: profile.gender || "",
        dob:
          profile.dob && !isNaN(new Date(profile.dob).getTime())
            ? new Date(profile.dob).toISOString().split("T")[0]
            : "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
      });

      if (profile.profilePhoto) {
        setPhotoPreview(profile.profilePhoto);
      }
    }
  }, [profile]);

  const updateField = (key: keyof typeof form, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleContinue = () => {
    navigate(PATHS.EXPERIENCE_DETAILS);
  };

  const email = profile?.user?.email ?? "—";
  const mobile = profile?.user?.mobile ?? "—";

  return (
    <div className={cn("min-h-screen flex flex-col items-center pb-12", bgCss)}>
      <RegistrationStepper currentStep={1} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-xl p-6 rounded-[36px] border border-white/10",
          "bg-[#121212]/90 backdrop-blur-3xl shadow-2xl relative mx-4"
        )}
      >
        <header className="text-center mb-8">
          <h1 className="text-[26px] font-bold text-white tracking-tight">
            Basic Profile Details{" "}
            <span className="text-zinc-500 font-normal">(Step 1 of 5)</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Complete your personal details.</p>
        </header>

        <div className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {/* Profile Photo & Initial Fields Row */}
          <div className="flex gap-4">
            <div className="w-[140px] flex flex-col items-center justify-center p-4 rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="mb-4">
                <Avatar className="w-24 h-24 border-2 border-white/5 bg-zinc-800">
                  <AvatarImage src={photoPreview || profile?.profilePhoto || ""} />
                  <AvatarFallback className="bg-zinc-800">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-[#8b5e52]" />
                      <div className="w-12 h-8 rounded-t-full bg-[#2d3a4d] -mt-1" />
                    </div>
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 h-8 px-4 rounded-xl flex gap-2"
              >
                <Camera size={14} />
                <span className="text-xs font-semibold">Upload</span>
              </Button>
              <span className="text-[10px] text-zinc-500 text-center font-medium mt-3 leading-tight">
                Add Profile<br />Photo
              </span>
            </div>

            <div className="flex-1 space-y-3">
              <RegistrationField
                icon={<User />}
                label="Full Name"
                placeholder="Enter Full Name"
                value={form.fullName}
                onChange={(e: any) => updateField("fullName", e.target.value)}
              />
              <RegistrationField
                icon={<VenusAndMars />}
                label="Gender"
                isSelect
                value={form.gender}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ]}
                onChange={(e: any) => updateField("gender", e.target.value)}
              />
              {/* sumit */}
              <RegistrationField
                icon={<Calendar />}
                label="DOB"
                type="date"
                value={form.dob}
                onChange={(e: any) => updateField("dob", e.target.value)}
              />
            </div>
          </div>

          <RegistrationField
            icon={<MapPin />}
            label="Address"
            placeholder="Enter Street Address"
            value={form.address}
            onChange={(e: any) => updateField("address", e.target.value)}
          />

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7 flex flex-col p-3.5 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-400/80 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col border-b border-white/5 pb-2">
                    <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-tight">
                      City / State
                    </span>
                    <input
                      placeholder="City"
                      value={form.city}
                      onChange={e => updateField("city", e.target.value)}
                      className="bg-transparent text-sm text-zinc-300 outline-none mt-1 placeholder:text-zinc-600"
                    />
                  </div>
                  <input
                    placeholder="State"
                    value={form.state}
                    onChange={e => updateField("state", e.target.value)}
                    className="bg-transparent text-sm text-zinc-300 outline-none pt-1 placeholder:text-zinc-600 w-full"
                  />
                </div>
              </div>
            </div>

            <RegistrationField
              className="col-span-5 items-center"
              icon={<MapPin />}
              label="Pincode"
              placeholder="XXXXXX"
              value={form.pincode}
              onChange={(e: any) => updateField("pincode", e.target.value)}
            />
          </div>

          {/* Read-only contact fields */}
          <RegistrationField icon={<Mail />} label="Email" value={email} readOnly />
          <RegistrationField
            icon={<Smartphone />}
            label="Mobile"
            value={mobile}
            iconColor="text-blue-300"
            readOnly
          />
        </div>

        <div className="mt-10">
          <Button
            onClick={handleContinue}
            className={cn(
              "w-full h-14 rounded-full text-lg font-bold transition-all",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-blue-400/20 shadow-[0_0_20px_rgba(37,99,235,0.15)] text-white flex items-center justify-center gap-2"
            )}
          >
            Continue to document <ChevronRight className="font-light text-xl opacity-80" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default BasicProfileDetails;