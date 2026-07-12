


import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, VenusAndMars, Calendar, MapPin, Mail, Smartphone, Camera, ChevronRight, Globe, ChevronDown
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

  const loginIdentifier = (sessionStorage.getItem("vlm_email") || "").trim();
  const isEmailLogin = loginIdentifier.includes("@");

  useEffect(() => {
    if (profile) {
      const defaultEmail = profile.user?.email || (isEmailLogin ? loginIdentifier : "");
      const defaultMobile = profile.user?.mobile || (!isEmailLogin ? loginIdentifier : "");

      const dbFirstName = (profile.firstName || "").trim();
      const isDefaultFirstName = !dbFirstName || dbFirstName.toLowerCase() === "teacher";

      const dbLastName = (profile.lastName || "").trim();
      const isDefaultLastName = !dbLastName || dbLastName.toLowerCase() === "profile";

      setForm({
        firstName: isDefaultFirstName ? "" : dbFirstName,
        middleName: profile.middleName || "",
        lastName: isDefaultLastName ? "" : dbLastName,
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
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
    if (key === "city" || key === "state") {
      setErrors(prev => ({ ...prev, city: "", state: "" }));
    }
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
    if (!form.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const birthDate = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (birthDate.getFullYear() < today.getFullYear() - 100) {
        newErrors.dob = "Enter a valid year (max 100 years old)";
      } else if (age < 18) {
        newErrors.dob = "Teacher must be at least 18 years old";
      } else if (birthDate > today) {
        newErrors.dob = "Future dates are not allowed";
      }
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (form.pincode.trim().length !== 6) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      setTimeout(() => {
        const firstErrorEl = document.querySelector(".border-red-500, .border-red-500\\/50");
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
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

          {/* Card 1: Personal Details */}
          <div className="p-5 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4 shadow-sm relative">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-1">Personal Details</h3>
            
            {/* Centered Profile Photo Uploader */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 bg-white/[0.01] w-full max-w-sm mx-auto mb-4">
              <div className="mb-3 relative">
                <Avatar className="w-20 h-20 border border-white/5 bg-zinc-800">
                  <AvatarImage src={photoPreview || profile?.profilePhoto || ""} />
                  <AvatarFallback className="bg-zinc-800">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-[#8b5e52]" />
                      <div className="w-10 h-7 rounded-t-full bg-[#2d3a4d] -mt-1" />
                    </div>
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 h-8 px-4 rounded-lg flex gap-2"
              >
                <Camera size={12} />
                <span className="text-[11px] font-semibold">Upload Photo</span>
              </Button>
            </div>

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
                  required
                  error={errors.lastName}
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
          </div>

          {/* Card 2: Address Details */}
          <div className="p-5 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4 shadow-sm relative">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-1">Address Details</h3>
            
            <RegistrationField
              icon={<MapPin />}
              label="Address"
              placeholder="Enter Street Address"
              value={form.address}
              required
              error={errors.address}
              onChange={(e: any) => updateField("address", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              {/* City Custom Field */}
              <div className={cn(
                "flex flex-col gap-1 w-full p-3.5 rounded-2xl border transition-all bg-white/[0.03] hover:bg-white/[0.05]",
                errors.city ? "border-red-500/50 bg-red-500/[0.02]" : "border-white/10"
              )}>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-blue-400/80 shrink-0 stroke-[1.5]" />
                  <div className="flex flex-1 flex-col leading-tight">
                    <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-0.5">
                      City
                      <span className="text-red-500 font-black text-xs inline-block ml-0.5">*</span>
                    </span>
                    <div className="mt-0.5">
                      <AutocompleteDropdown
                        placeholder="Select City"
                        value={form.city}
                        options={CITIES}
                        allowCustomVal={true}
                        onChange={(val) => updateField("city", val)}
                      />
                    </div>
                  </div>
                </div>
                {errors.city && (
                  <span className="text-[9px] font-bold text-red-400/90 ml-2 uppercase tracking-wide">
                    {errors.city}
                  </span>
                )}
              </div>

              {/* State Custom Field */}
              <div className={cn(
                "flex flex-col gap-1 w-full p-3.5 rounded-2xl border transition-all bg-white/[0.03] hover:bg-white/[0.05]",
                errors.state ? "border-red-500/50 bg-red-500/[0.02]" : "border-white/10"
              )}>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-blue-400/80 shrink-0 stroke-[1.5]" />
                  <div className="flex flex-1 flex-col leading-tight">
                    <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-0.5">
                      State
                      <span className="text-red-500 font-black text-xs inline-block ml-0.5">*</span>
                    </span>
                    <div className="mt-0.5">
                      <AutocompleteDropdown
                        placeholder="Select State"
                        value={form.state}
                        options={STATES}
                        onChange={(val) => updateField("state", val)}
                      />
                    </div>
                  </div>
                </div>
                {errors.state && (
                  <span className="text-[9px] font-bold text-red-400/90 ml-2 uppercase tracking-wide">
                    {errors.state}
                  </span>
                )}
              </div>
            </div>

            <RegistrationField
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

          {/* Card 3: Contact Details */}
          <div className="p-5 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4 shadow-sm relative">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-1">Contact Details</h3>

            <RegistrationField 
              icon={<Mail />} 
              label="Email" 
              placeholder="Enter Email Address"
              value={form.email} 
              required
              error={errors.email}
              readOnly={isEmailLogin}
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
              readOnly={!isEmailLogin}
              onChange={(e: any) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                updateField("mobile", val);
              }}
            />
          </div>
        </div>

        <div className="mt-8">
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

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Pune",
  "Kolkata",
  "Hyderabad",
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface AutocompleteDropdownProps {
  placeholder: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  allowCustomVal?: boolean;
}

function AutocompleteDropdown({ placeholder, value, options, onChange, allowCustomVal }: AutocompleteDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    } else {
      setSearchQuery(value);
    }
  }, [open, value]);

  const displayValue = open ? searchQuery : value;

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full cursor-pointer" ref={ref} onClick={() => setOpen(true)}>
      <div className="flex items-center justify-between gap-1">
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
            if (allowCustomVal) {
              onChange(e.target.value);
            } else {
              const matched = options.find(opt => opt.toLowerCase() === e.target.value.toLowerCase());
              if (matched) {
                onChange(matched);
              } else if (!e.target.value) {
                onChange("");
              }
            }
          }}
          className="bg-transparent border-none outline-none p-0 m-0 text-[14px] w-full text-zinc-350 focus-visible:ring-0 placeholder:text-zinc-650"
        />
        <ChevronDown size={14} className={cn("text-zinc-500 transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </div>

      {open && (
        <div className="absolute left-0 right-0 mt-3 z-[999] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl py-1 overflow-hidden flex flex-col">
          <div className="max-h-[128px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-xs text-zinc-500 text-center">No matches found</p>
            ) : (
              filteredOptions.map((opt) => {
                const isSel = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-xs transition-colors hover:bg-zinc-850 cursor-pointer block",
                      isSel ? "text-blue-400 font-extrabold bg-zinc-800" : "text-zinc-400"
                    )}
                  >
                    {opt}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BasicProfileDetails;