import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
  User,
  BookOpen,
  Globe,
  ChevronLeft,
  Pencil,
  RefreshCw,
  Settings,
  Languages,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn & UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useStudentProfile, useUpdateProfile } from "@/hooks/use-student";
import LoadingSkeleton from "@/components/basic/student/LoadingSkeleton";
import { studentApi } from "@/lib/student-api";
import { toast } from "sonner";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

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

export default function EditProfile() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useStudentProfile();
  const mutation = useUpdateProfile();
  const isEditing = true;

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "male",
    dateOfBirth: "",
    nickname: "",
    class: "",
    city: "",
    state: "",
    pincode: "",
    subjects: [] as string[],
    weakSubjects: [] as string[],
    profilePhoto: "",
    preferredLanguage: "english",
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const profileDetails = (profile as any)?.data ?? profile;
  const hasGenderOriginal = !!profileDetails?.gender;
  const hasDobOriginal = !!profileDetails?.dateOfBirth;

  const resetForm = () => {
    if (profile) {
      const p = (profile as any).data ?? profile;
      setFormData({
        firstName: p.firstName ?? "",
        middleName: p.middleName ?? "",
        lastName: p.lastName ?? "",
        gender: p.gender ?? "male",
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : "",
        nickname: p.nickname ?? "",
        class: p.class || p.className || "",
        city: p.city ?? "",
        state: p.state ?? "",
        pincode: p.pincode ?? "",
        subjects: p.subjects ?? [],
        weakSubjects: p.weakSubjects ?? [],
        profilePhoto: p.profilePhoto ?? "",
        preferredLanguage: p.preferredLanguage ?? "english",
      });
    }
  };

  useEffect(() => {
    resetForm();
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await studentApi.uploadProfilePhoto(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, profilePhoto: res.url }));
        toast.success("Profile photo uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handlePhotoUpload(e as any);
    input.click();
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="relative min-h-svh w-full bg-[#f4f6ff] text-slate-800 flex flex-col items-center px-5 pt-4 overflow-x-hidden pb-32 font-sans">
      <div className="max-w-md w-full flex flex-col gap-5">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center gap-4 pb-2 border-b border-slate-100 shrink-0">
          <button
            onClick={() => navigate(PATHS.PROFILE)}
            className="h-10 w-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-800 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-sm font-black tracking-tight text-slate-800">Edit Settings</h1>
        </header>

        {/* ── PROFILE AVATAR BLOCK ── */}
        <div className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm w-full">
          <div className="relative">
            <div className="relative h-24 w-24 rounded-full border-4 border-violet-400 bg-slate-50 flex items-center justify-center shadow-md overflow-hidden">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={38} className="text-violet-500" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-violet-400 animate-spin" />
                </div>
              )}
            </div>
            {/* Pencil Button overlay to edit profile photo */}
            <button 
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-violet-500 text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:bg-violet-600 active:scale-95 transition-all"
            >
              <Pencil size={12} strokeWidth={3} />
            </button>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">My Profile</h2>
            <p className="text-violet-600 text-xs font-black tracking-wider uppercase">
              Edit Details
            </p>
          </div>
        </div>

        {/* ── FORM FIELDS CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-5 w-full">
          <div className="flex items-center border-b border-slate-100 pb-3 px-0.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <User size={15} className="text-violet-600" /> Edit Details
            </h3>
          </div>

          <main className="w-full space-y-4">
            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
              label="First Name"
              value={formData.firstName}
              isEditing={isEditing}
            >
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    firstName: e.target.value,
                  })
                }
                className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5"
                placeholder="First Name"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
              label="Middle Name"
              value={formData.middleName}
              isEditing={isEditing}
            >
              <Input
                value={formData.middleName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    middleName: e.target.value,
                  })
                }
                className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5"
                placeholder="Middle Name"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
              label="Last Name"
              value={formData.lastName}
              isEditing={isEditing}
            >
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastName: e.target.value,
                  })
                }
                className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5"
                placeholder="Last Name"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
              label="Gender"
              value={formData.gender}
              isEditing={isEditing}
            >
              <Select
                value={formData.gender}
                disabled={hasGenderOriginal}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    gender: val ?? "male",
                  })
                }
              >
                <SelectTrigger className={cn("border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 shadow-none focus:ring-0 flex items-center justify-between w-full mt-0.5", hasGenderOriginal && "opacity-60 cursor-not-allowed pointer-events-none")}>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
              label="Date of Birth"
              value={formData.dateOfBirth}
              isEditing={isEditing}
            >
              <Input
                type="date"
                value={formData.dateOfBirth}
                disabled={hasDobOriginal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dateOfBirth: e.target.value,
                  })
                }
                className={cn("border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5", hasDobOriginal && "opacity-60 cursor-not-allowed")}
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<User size={16} className="text-violet-600 mr-2.5" />}
              label="Nickname"
              value={formData.nickname}
              isEditing={isEditing}
            >
              <Input
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nickname: e.target.value,
                  })
                }
                className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5"
                placeholder="Nickname"
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<BookOpen size={16} className="text-violet-600 mr-2.5" />}
              label="Class"
              value={formData.class}
              isEditing={isEditing}
            >
              <AutocompleteDropdown
                placeholder="Select Class"
                value={formData.class}
                options={CLASSES}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    class: value,
                  })
                }
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<Languages size={16} className="text-violet-600 mr-2.5" />}
              label="Preferred Language"
              value={formData.preferredLanguage}
              isEditing={isEditing}
            >
              <Select
                value={formData.preferredLanguage}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    preferredLanguage: val ?? "english",
                  })
                }
              >
                <SelectTrigger className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus:ring-0 flex justify-between w-full mt-0.5 select-none">
                  <SelectValue placeholder="Preferred Language" />
                </SelectTrigger>

                <SelectContent className="bg-white border-slate-100 text-slate-700 rounded-2xl shadow-lg">
                  <SelectItem value="english" className="focus:bg-violet-50 focus:text-violet-600 rounded-lg">English</SelectItem>
                  <SelectItem value="hindi" className="focus:bg-violet-50 focus:text-violet-600 rounded-lg">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </EditFieldWrapper>
          </main>
        </div>

        {/* ── ADDRESS SECTION CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-5 w-full">
          <div className="flex items-center border-b border-slate-100 pb-3 px-0.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <MapPin size={15} className="text-violet-600" /> Address Details
            </h3>
          </div>
          <main className="w-full space-y-4">
            <EditFieldWrapper
              icon={<Globe size={16} className="text-violet-600 mr-2.5" />}
              label="City"
              value={formData.city}
              isEditing={isEditing}
            >
              <AutocompleteDropdown
                placeholder="Select City"
                value={formData.city}
                options={CITIES}
                allowCustomVal={true}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    city: value,
                  })
                }
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<Globe size={16} className="text-violet-600 mr-2.5" />}
              label="State"
              value={formData.state}
              isEditing={isEditing}
            >
              <AutocompleteDropdown
                placeholder="Select State"
                value={formData.state}
                options={STATES}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    state: value,
                  })
                }
              />
            </EditFieldWrapper>

            <EditFieldWrapper
              icon={<MapPin size={16} className="text-violet-600 mr-2.5" />}
              label="Pincode"
              value={formData.pincode}
              isEditing={isEditing}
            >
              <Input
                value={formData.pincode}
                maxLength={6}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pincode: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5"
                placeholder="Pincode"
              />
            </EditFieldWrapper>
          </main>
        </div>



        {/* ── SUBJECT SECTION CARD ── */}
        <div className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-5 w-full">
          <div className="flex items-center border-b border-slate-100 pb-3 px-0.5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <BookOpen size={15} className="text-violet-600" /> Subjects Info
            </h3>
          </div>

          <div className="space-y-3">
            {/* Preferred Subjects */}
            <div 
              onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "preferred" } })}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BookOpen size={16} className="text-violet-600" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-800 block">Preferred Subjects</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Click to edit preferred subjects</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-slate-400 rotate-180" />
            </div>

            {/* Weak Subjects */}
            <div 
              onClick={() => navigate(PATHS.SUBJECT_SELECTION, { state: { fromProfile: true, type: "weak" } })}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <BookOpen size={16} className="text-red-500" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-800 block">Weak Subjects</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Click to edit weak subjects</span>
                </div>
              </div>
              <ChevronLeft size={16} className="text-slate-400 rotate-180" />
            </div>
          </div>
        </div>

        {/* ── SAVE ACTION BUTTON ── */}
        <div className="mt-2 w-full">
          <Button
            onClick={() => mutation.mutate({
              firstName: formData.firstName,
              middleName: formData.middleName,
              lastName: formData.lastName,
              gender: formData.gender,
              dateOfBirth: formData.dateOfBirth,
              nickname: formData.nickname,
              class: formData.class.replace("Class ", "").replace("th", ""),
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              subjects: formData.subjects,
              weakSubjects: formData.weakSubjects,
              profilePhoto: formData.profilePhoto,
              preferredLanguage: formData.preferredLanguage,
            }, {
              onSuccess: () => {
                setShowSaveSuccess(true);
                toast.success("Profile changes saved!");
                setTimeout(() => {
                  setShowSaveSuccess(false);
                  navigate(PATHS.PROFILE);
                }, 1000);
              }
            })}
            disabled={mutation.isPending}
            className="w-full h-12 rounded-2xl text-xs font-black tracking-widest bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-500/10 transition-all active:scale-[0.98]"
          >
            {mutation.isPending ? "SAVING..." : "SAVE CHANGES"}
          </Button>
          
          {showSaveSuccess && (
            <p className="text-center text-xs font-black text-violet-600 animate-pulse mt-2.5">
              ✓ Profile Saved Successfully!
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

function EditFieldWrapper({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isEditing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700">
        {icon}
        <div className="flex-1 min-w-0 ml-1">{children}</div>
      </div>
    </div>
  );
}

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
    <div className="relative w-full" ref={ref}>
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
        className="border-none bg-transparent h-auto p-0 text-xs text-slate-700 font-bold focus-visible:ring-0 placeholder:text-slate-300 mt-0.5 w-full outline-none"
      />

      {open && (
        <div className="absolute left-0 right-0 mt-3 z-[999] rounded-2xl bg-white border border-slate-100 shadow-xl py-1 overflow-hidden flex flex-col">
          <div className="max-h-[128px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-400 text-center">No matches found</p>
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
                      "w-full px-4 py-2 text-left text-xs transition-colors hover:bg-slate-50 cursor-pointer block",
                      isSel ? "text-violet-600 font-extrabold bg-slate-50" : "text-slate-700"
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