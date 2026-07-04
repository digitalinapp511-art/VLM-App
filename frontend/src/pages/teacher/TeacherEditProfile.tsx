import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { PATHS } from "@/routes/paths";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar, VenusAndMars, Save
} from "lucide-react";

export default function TeacherEditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
    mobile: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  useEffect(() => {
    if (profile) {
      const loginIdentifier = (sessionStorage.getItem("vlm_email") || "").trim();
      const isEmailLogin = loginIdentifier.includes("@");
      
      const defaultEmail = isEmailLogin ? (profile.user?.email || loginIdentifier) : "";
      const defaultMobile = !isEmailLogin ? (profile.user?.mobile || loginIdentifier) : "";

      const dbName = (profile.fullName || "").trim();
      const isDefaultName = !dbName || dbName.toLowerCase() === "teacher";

      setForm({
        fullName: isDefaultName ? "" : dbName,
        gender: profile.gender || "",
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      let finalPhotoUrl = profile?.profilePhoto || "";
      if (photoFile) {
        const uploadRes = await teacherApi.uploadProfilePhoto(photoFile);
        if (uploadRes?.url) {
          finalPhotoUrl = uploadRes.url;
        }
      }
      return teacherApi.updateProfile({
        ...payload,
        profilePhoto: finalPhotoUrl
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["teacherProfile"] });
      navigate(PATHS.TEACHER_PROFILE);
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || "";
      if (errMsg.toLowerCase().includes("mobile number")) {
        setErrors(prev => ({ ...prev, mobile: errMsg }));
      } else if (errMsg.toLowerCase().includes("email address")) {
        setErrors(prev => ({ ...prev, email: errMsg }));
      } else {
        toast.error(errMsg || "Failed to update profile");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.dob) newErrors.dob = "Date of Birth is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center text-zinc-400", bgCss)}>
        Loading Profile...
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 pb-28 relative overflow-x-hidden", bgCss)}>
      {/* Header */}
      <header className="w-full max-w-xl flex items-center mb-6 z-10 relative">
        <button
          type="button"
          onClick={() => navigate(PATHS.TEACHER_PROFILE)}
          className="absolute left-0 p-2 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex-grow text-center text-lg font-bold text-white uppercase tracking-widest px-10">
          Edit Profile
        </h1>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />

      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">
        {/* Avatar block */}
        <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-white/10 bg-zinc-800">
              <AvatarImage src={photoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.fullName || "Teacher"}`} />
              <AvatarFallback>{(form.fullName || "T")[0]}</AvatarFallback>
            </Avatar>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full border border-black hover:bg-blue-500 transition-colors shadow-lg"
            >
              <Camera size={14} className="text-white" />
            </button>
          </div>
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Change Profile Photo</span>
        </div>

        {/* Basic Info Card */}
        <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
            <User size={16} /> Personal Information
          </h3>

          <div className="space-y-3.5">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">Full Name</label>
              <div className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all",
                errors.fullName ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
              )}>
                <User size={16} className="text-zinc-500" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full"
                  placeholder="Full Name"
                />
              </div>
            </div>

            {/* Gender & DOB row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">Gender</label>
                <div className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all",
                  errors.gender ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
                )}>
                  <User size={16} className="text-zinc-500" />
                  <select
                    value={form.gender}
                    onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-zinc-950">Select Gender</option>
                    <option value="male" className="bg-zinc-950">Male</option>
                    <option value="female" className="bg-zinc-950">Female</option>
                    <option value="other" className="bg-zinc-950">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">DOB</label>
                <div className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all",
                  errors.dob ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
                )}>
                  <Calendar size={16} className="text-zinc-500" />
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm(f => ({ ...f, dob: e.target.value }))}
                    className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Email & Mobile Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">Email</label>
                <div className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all",
                  errors.email ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
                )}>
                  <Mail size={16} className="text-zinc-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full"
                    placeholder="Email Address"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">Mobile</label>
                <div className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all",
                  errors.mobile ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
                )}>
                  <Phone size={16} className="text-zinc-500" />
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm(f => ({ ...f, mobile: e.target.value }))}
                    className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
            <MapPin size={16} /> Location Details
          </h3>

          <div className="space-y-3.5">
            {/* Street Address */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">Street Address</label>
              <div className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all",
                errors.address ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
              )}>
                <MapPin size={16} className="text-zinc-500" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full"
                  placeholder="Address"
                />
              </div>
            </div>

            {/* City, State, Pincode row */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8 flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">City / State</label>
                <div className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all",
                  (errors.city || errors.state) ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
                )}>
                  <MapPin size={16} className="text-zinc-500 shrink-0" />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                      className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full border-r border-white/10 pr-2"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                      className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full"
                      placeholder="State"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-4 flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase ml-1">Pincode</label>
                <div className={cn(
                  "flex items-center gap-3 p-3.5 rounded-2xl border bg-black/40 transition-all w-full",
                  errors.pincode ? "border-red-500/50 bg-red-500/[0.01]" : "border-white/5"
                )}>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setForm(f => ({ ...f, pincode: val }));
                    }}
                    className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full"
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className={cn(
              "w-full h-16 rounded-full text-base font-bold uppercase tracking-tight flex items-center justify-center gap-2",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110 text-white border border-blue-400/20 shadow-2xl"
            )}
          >
            <Save size={18} />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
