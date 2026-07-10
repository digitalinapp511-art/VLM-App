


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
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
    mobile: "",
  });

  useEffect(() => {
    if (profile) {
      const loginIdentifier = (sessionStorage.getItem("vlm_email") || "").trim();
      const isEmailLogin = loginIdentifier.includes("@");
      
      const defaultEmail = profile.user?.email || (isEmailLogin ? loginIdentifier : "");
      const defaultMobile = profile.user?.mobile || (!isEmailLogin ? loginIdentifier : "");

      const dbFirstName = (profile.firstName || "").trim();
      const isDefaultFirstName = !dbFirstName || dbFirstName.toLowerCase() === "teacher";

      setForm({
        firstName: isDefaultFirstName ? "" : dbFirstName,
        middleName: profile.middleName || "",
        lastName: profile.lastName || "",
        gender: profile.gender || "",
        dob:
          profile.dob && !isNaN(new Date(profile.dob).getTime())
            ? new Date(profile.dob).toISOString().split("T")[0]
            : "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        email: defaultEmail,
        mobile: defaultMobile,
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.dob) newErrors.dob = "Date of birth is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      let finalPhotoUrl = profile?.profilePhoto || "";

      if (photoFile) {
        const uploadRes = await teacherApi.uploadProfilePhoto(photoFile);
        if (uploadRes?.url) {
          finalPhotoUrl = uploadRes.url;
        }
      }

      await teacherApi.updateProfile({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        gender: form.gender,
        dob: form.dob,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        profilePhoto: finalPhotoUrl,
        email: form.email,
        mobile: form.mobile
      });

      toast.success("Profile details saved successfully!");
      navigate(PATHS.QUALIFICATION_DETAILS);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || "";
      if (errMsg.toLowerCase().includes("mobile number")) {
        setErrors(prev => ({ ...prev, mobile: errMsg }));
      } else if (errMsg.toLowerCase().includes("email address")) {
        setErrors(prev => ({ ...prev, email: errMsg }));
      } else {
        toast.error(errMsg || "Failed to save details");
      }
    } finally {
      setIsSaving(false);
    }
  };

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

        <div className="space-y-5">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {/* Centered Profile Photo Uploader */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 bg-white/[0.02] w-full max-w-sm mx-auto mb-6">
            <div className="mb-4 relative">
              <Avatar className="w-28 h-28 border-2 border-white/5 bg-zinc-800">
                <AvatarImage src={photoPreview || profile?.profilePhoto || ""} />
                <AvatarFallback className="bg-zinc-800">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#8b5e52]" />
                    <div className="w-14 h-9 rounded-t-full bg-[#2d3a4d] -mt-1" />
                  </div>
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 h-9 px-6 rounded-xl flex gap-2"
            >
              <Camera size={14} />
              <span className="text-xs font-semibold">Upload Photo</span>
            </Button>
          </div>

          {/* Clean Vertical Form Fields */}
          <div className="space-y-4">
            <RegistrationField
              icon={<User />}
              label="First Name"
              placeholder="First Name"
              value={form.firstName}
              required
              error={errors.firstName}
              onChange={(e: any) => updateField("firstName", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <RegistrationField
                icon={<User />}
                label="Middle Name"
                placeholder="Middle Name"
                value={form.middleName}
                onChange={(e: any) => updateField("middleName", e.target.value)}
              />
              <RegistrationField
                icon={<User />}
                label="Last Name"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e: any) => updateField("lastName", e.target.value)}
              />
            </div>
            <RegistrationField
              icon={<User />}
              label="Gender"
              isSelect
              value={form.gender}
              required
              error={errors.gender}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
              onChange={(e: any) => updateField("gender", e.target.value)}
            />
            <RegistrationField
              icon={<Calendar />}
              label="DOB"
              type="date"
              value={form.dob}
              required
              error={errors.dob}
              onChange={(e: any) => updateField("dob", e.target.value)}
            />
          </div>

          <RegistrationField
            icon={<MapPin />}
            label="Address"
            placeholder="Enter Street Address"
            value={form.address}
            required
            error={errors.address}
            onChange={(e: any) => updateField("address", e.target.value)}
          />

          <div className="grid grid-cols-12 gap-3 items-start">
            <div className={cn(
              "col-span-7 flex flex-col p-3.5 rounded-2xl border bg-white/[0.03] transition-all hover:bg-white/[0.05]",
              (errors.city || errors.state) ? "border-red-500/50 bg-red-500/[0.02]" : "border-white/10"
            )}>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-400/80 mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col border-b border-white/5 pb-2">
                    <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-0.5">
                      City / State
                      <span className="text-red-500 font-black text-xs inline-block ml-0.5">*</span>
                    </span>
                    <input
                      placeholder="City"
                      value={form.city}
                      onChange={e => updateField("city", e.target.value)}
                      className="bg-transparent text-sm text-zinc-300 outline-none mt-1 placeholder:text-zinc-600 w-full"
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
              {(errors.city || errors.state) && (
                <span className="text-[9px] font-bold text-red-400/90 mt-2 uppercase tracking-wide">
                  {errors.city || errors.state}
                </span>
              )}
            </div>

            <RegistrationField
              className="col-span-5"
              icon={<MapPin />}
              label="Pincode"
              placeholder="XXXXXX"
              value={form.pincode}
              required
              error={errors.pincode}
              onChange={(e: any) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                updateField("pincode", val);
              }}
            />
          </div>

          {/* Editable contact fields */}
          <RegistrationField 
            icon={<Mail />} 
            label="Email" 
            placeholder="Enter Email Address"
            value={form.email} 
            required
            error={errors.email}
            onChange={(e: any) => updateField("email", e.target.value)} 
          />
          <RegistrationField
            icon={<Smartphone />}
            label="Mobile"
            placeholder="Enter Mobile Number"
            value={form.mobile}
            iconColor="text-blue-300"
            required
            error={errors.mobile}
            onChange={(e: any) => updateField("mobile", e.target.value)}
          />
        </div>

        <div className="mt-10">
          <Button
            onClick={handleContinue}
            disabled={isSaving}
            className={cn(
              "w-full h-14 rounded-full text-lg font-bold transition-all",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-blue-400/20 shadow-[0_0_20px_rgba(37,99,235,0.15)] text-white flex items-center justify-center gap-2"
            )}
          >
            {isSaving ? "Saving details..." : (
              <>
                Continue to qualifications <ChevronRight className="font-light text-xl opacity-80" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default BasicProfileDetails;