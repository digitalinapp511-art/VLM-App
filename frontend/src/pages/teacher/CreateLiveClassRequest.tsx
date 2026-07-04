import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mic, Calendar, Clock, Send, Star, Home, BookOpen, Wallet, Library, User, ChevronDown, Plus, Trash2, Edit2 } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/routes/paths";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";

import { FormSection } from "@/components/basic/teacher/RequestFormComponents";

const CreateLiveClassRequest: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [topic, setTopic] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Maths");
  const [selectedClass, setSelectedClass] = useState("Class 10th");
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [repeatWeekly, setRepeatWeekly] = useState(true);

  // Custom slots state
  const [customSlots, setCustomSlots] = useState<Array<{
    id: string;
    startTime: string;
    endTime: string;
    subject: string;
    date: string;
  }>>([]);

  // Form to add a new slot
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState("10:00");
  const [newSlotEnd, setNewSlotEnd] = useState("11:00");
  const [newSlotSubject, setNewSlotSubject] = useState("Maths");

  const { data: profile } = useQuery({
    queryKey: ["teacherProfile"],
    queryFn: teacherApi.getProfile,
  });

  const p = (profile as any)?.user || profile || {};
  const availableSubjects = p.subjects && p.subjects.length > 0 ? p.subjects : ["Maths", "Physics", "Chemistry", "Biology"];
  const availableClasses = p.classes && p.classes.length > 0 ? p.classes : ["Class 9th", "Class 10th", "Class 11th", "Class 12th"];
  const availableBoards = p.boards && p.boards.length > 0 ? p.boards : ["CBSE", "ICSE", "State Board", "IB"];
  const availableLanguages = p.languages && p.languages.length > 0 ? p.languages : ["English", "Hindi"];

  const DAYS_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dateObj = selectedDate ? new Date(selectedDate) : null;
  const dayOfWeekString = dateObj ? DAYS_MAP[dateObj.getDay()] : '';

  // Get availability slots matching selected day of the week
  const profileSlots = (p.availabilitySlots || [])
    .filter((s: any) => s.day === dayOfWeekString)
    .map((s: any, idx: number) => ({
      id: `profile-${idx}`,
      startTime: s.startTime,
      endTime: s.endTime,
      subject: s.subjects?.[0] || selectedSubject,
      type: "profile"
    }));

  const filteredCustomSlots = customSlots.filter(s => s.date === selectedDate);
  const visibleSlots = [...profileSlots, ...filteredCustomSlots];

  // Set default selected slot
  React.useEffect(() => {
    if (visibleSlots.length > 0) {
      if (!selectedSlotId || !visibleSlots.some(s => s.id === selectedSlotId)) {
        setSelectedSlotId(visibleSlots[0].id);
      }
    } else {
      setSelectedSlotId(null);
    }
  }, [selectedDate, visibleSlots.length]);

  const handleAddSlot = () => {
    const nextId = `custom-${customSlots.length + 1}`;
    setCustomSlots([
      ...customSlots,
      { id: nextId, startTime: newSlotStart, endTime: newSlotEnd, subject: newSlotSubject, date: selectedDate }
    ]);
    setSelectedSlotId(nextId);
    setShowAddSlotForm(false);
  };

  const handleDeleteSlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomSlots(customSlots.filter(s => s.id !== id));
    if (selectedSlotId === id) {
      setSelectedSlotId(null);
    }
  };

  const formatTimeTo12h = (time24: string) => {
    const [hoursStr, minutesStr] = time24.split(":");
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, "0")}:${minutesStr} ${ampm}`;
  };

  const createClassMutation = useMutation({
    mutationFn: teacherApi.createLiveClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveClasses"] });
      navigate(PATHS.TEACHER_CLASSES);
    },
    onError: (err) => {
      console.error("Failed to create live class request:", err);
      alert("Failed to submit request. Please try again.");
    }
  });

  const handleSubmit = () => {
    if (!topic.trim()) {
      alert("Please enter a class topic.");
      return;
    }
    const selectedSlot = visibleSlots.find(s => s.id === selectedSlotId);
    if (!selectedSlot) {
      alert("Please select or add a time slot.");
      return;
    }

    const scheduledAt = `${selectedDate}T${selectedSlot.startTime}:00`;

    // Calculate duration in minutes
    let duration = 30; // fallback default
    if (selectedSlot.startTime && selectedSlot.endTime) {
      const [sh, sm] = selectedSlot.startTime.split(":").map(Number);
      const [eh, em] = selectedSlot.endTime.split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      if (endMinutes > startMinutes) {
        duration = endMinutes - startMinutes;
      }
    }

    createClassMutation.mutate({
      topic,
      subject: selectedSubject,
      class: selectedClass,
      board: selectedBoard,
      language: selectedLanguage,
      scheduledAt,
      description,
      isFree,
      duration,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-4 pb-28 relative overflow-x-hidden", bgCss)}>
      
      {/* Decorative Icons */}
      <div className="absolute top-20 -left-2 text-blue-500/20 blur-[1px]">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-1/2 -right-4 text-purple-500/20 blur-[1px]">
        <Star size={24} fill="currentColor" />
      </div>

      {/* App Bar */}
      <header className="w-full max-w-xl flex items-center py-4 mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-sm font-black text-white uppercase tracking-widest mr-10">
          Create Live Class Request
        </h1>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl space-y-6"
      >
        <motion.h2 variants={itemVariants} className="text-2xl font-black text-white text-center mb-2">
          Request New Live Session
        </motion.h2>

        {/* 1. Class Topic */}
        <motion.div variants={itemVariants}>
          <FormSection title="Class Topic">
            <div className="relative">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic name" 
                className="w-full h-14 px-5 pr-12 rounded-2xl border border-white/10 bg-zinc-900/40 text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <Mic size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500" />
            </div>
          </FormSection>
        </motion.div>

        {/* 2. Academic Details */}
        <motion.div variants={itemVariants}>
          <FormSection title="Academic Details">
            <div className="space-y-5">
              {/* Subject Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Subject</label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-zinc-900/40 text-white focus:outline-none appearance-none cursor-pointer text-sm font-medium"
                  >
                    {availableSubjects.map((sub: string) => (
                      <option key={sub} value={sub} className="bg-zinc-900 text-white">{sub}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Class Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Class</label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-zinc-900/40 text-white focus:outline-none appearance-none cursor-pointer text-sm font-medium"
                  >
                    {availableClasses.map((cls: string) => (
                      <option key={cls} value={cls} className="bg-zinc-900 text-white">{cls}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Board Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Board</label>
                <div className="relative">
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-zinc-900/40 text-white focus:outline-none appearance-none cursor-pointer text-sm font-medium"
                  >
                    {availableBoards.map((brd: string) => (
                      <option key={brd} value={brd} className="bg-zinc-900 text-white">{brd}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Language Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Language</label>
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-zinc-900/40 text-white focus:outline-none appearance-none cursor-pointer text-sm font-medium"
                  >
                    {availableLanguages.map((lang: string) => (
                      <option key={lang} value={lang} className="bg-zinc-900 text-white">{lang}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </FormSection>
        </motion.div>

        {/* 3. Schedule Date & Time */}
        <motion.div variants={itemVariants}>
          <FormSection title="Schedule Date & Time">
            <div className="space-y-6 py-2">
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Select Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-14 px-5 pr-12 rounded-2xl border border-white/10 bg-zinc-950/40 text-white focus:outline-none text-sm font-medium"
                  />
                  <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Days of week display (highlighted based on chosen date) */}
              <div className="flex justify-between px-2">
                {['M', 'T', 'WED', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const dateObj = selectedDate ? new Date(selectedDate) : null;
                  const dayOfWeekIndex = dateObj ? (dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1) : -1;
                  const isSelected = dayOfWeekIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300",
                        isSelected 
                          ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                          : "border-white/5 bg-[#18181b] text-zinc-500"
                      )}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Subject Selector from screenshot */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Active Subjects</label>
                <div className="flex flex-wrap gap-2.5">
                  {availableSubjects.map((sub: string) => {
                    const isSelected = selectedSubject === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubject(sub)}
                        type="button"
                        className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-bold border transition-all duration-300",
                          isSelected
                            ? "border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                            : "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10"
                        )}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selector list */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Select Time Slot</label>
                {visibleSlots.length === 0 ? (
                  <div className="p-5 text-center text-xs text-zinc-500 font-bold border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    No availability scheduled for {dayOfWeekString.toUpperCase()}s. Click below to add a slot.
                  </div>
                ) : (
                  visibleSlots.map((slot: any, index: number) => {
                    const isSelected = selectedSlotId === slot.id;
                    const borderColors = [
                      "border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.15)]",
                      "border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
                      "border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    ];
                    const cardBorderClass = isSelected 
                      ? borderColors[index % borderColors.length]
                      : "border-white/5 bg-white/[0.01] hover:border-white/10";

                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={cn(
                          "p-5 rounded-[24px] border cursor-pointer transition-all duration-300 flex items-center justify-between",
                          cardBorderClass
                        )}
                      >
                        <div className="space-y-1.5 text-left">
                          <span className="text-sm font-black text-white">
                            Slot {index + 1}: {formatTimeTo12h(slot.startTime)} - {formatTimeTo12h(slot.endTime)}
                          </span>
                          <div className="flex gap-2">
                            <span className="text-[10px] bg-cyan-950/20 text-cyan-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Subject: {slot.subject}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            {slot.type === "profile" ? "From Availability" : "Custom"}
                          </span>
                          {slot.type !== "profile" && (
                            <button 
                              type="button" 
                              onClick={(e) => handleDeleteSlot(slot.id, e)}
                              className="text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add New Time Slot Form trigger */}
              {!showAddSlotForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddSlotForm(true)}
                  className="w-full h-14 border-2 border-dashed border-blue-500/40 bg-blue-500/[0.02] hover:bg-blue-500/[0.05] rounded-3xl flex items-center justify-center gap-2 text-blue-400 text-sm font-bold tracking-wide transition-all"
                >
                  <Plus size={16} />
                  + Add New Time Slot
                </button>
              ) : (
                <div className="p-5 rounded-3xl border border-white/10 bg-black/45 space-y-4">
                  <span className="text-xs font-black uppercase text-white/50 tracking-wider">Add Custom Time Slot</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Start Time</label>
                      <input 
                        type="time" 
                        value={newSlotStart} 
                        onChange={(e) => setNewSlotStart(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-white/10 bg-zinc-900 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">End Time</label>
                      <input 
                        type="time" 
                        value={newSlotEnd} 
                        onChange={(e) => setNewSlotEnd(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-white/10 bg-zinc-900 text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Slot Subject</label>
                    <select
                      value={newSlotSubject}
                      onChange={(e) => setNewSlotSubject(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-zinc-900 text-white text-sm focus:outline-none"
                    >
                      {availableSubjects.map((sub: string) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      onClick={handleAddSlot}
                      className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Add Slot
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setShowAddSlotForm(false)}
                      variant="outline"
                      className="flex-1 h-10 rounded-xl border-white/10 bg-transparent text-white text-xs font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Repeat Schedule Weekly toggle from screenshot */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                <span className="text-xs font-bold text-white">Repeat Schedule Weekly</span>
                <input 
                  type="checkbox" 
                  checked={repeatWeekly} 
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-zinc-900 accent-blue-500" 
                />
              </div>

              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed text-center max-w-[280px] mx-auto">
                Set your preferred teaching hours. These will be visible to students for bookings. Overlapping or conflicting slots will be flagged.
              </p>
            </div>
          </FormSection>
        </motion.div>

        {/* 4. Description */}
        <motion.div variants={itemVariants}>
          <FormSection title="Class Description">
            <div className="relative">
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description for students..." 
                maxLength={500}
                className="w-full h-32 p-5 rounded-2xl border border-white/10 bg-zinc-900/40 text-white placeholder:text-zinc-700 focus:outline-none resize-none"
              />
              <span className="absolute bottom-3 right-5 text-[9px] font-bold text-zinc-700">
                Char Count: {description.length} / 500
              </span>
            </div>
          </FormSection>
        </motion.div>

        {/* 5. Session Type */}
        <motion.div variants={itemVariants}>
          <FormSection title="Session Type">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setIsFree(true)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 h-14 rounded-full border-2 transition-all",
                  isFree 
                    ? "border-cyan-400 bg-cyan-400/5 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] font-black"
                    : "border-white/10 bg-zinc-900/20 text-zinc-500 opacity-60"
                )}
              >
                <span className="text-xs uppercase tracking-widest">Free Session</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setIsFree(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 h-14 rounded-full border-2 transition-all",
                  !isFree 
                    ? "border-cyan-400 bg-cyan-400/5 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] font-black"
                    : "border-white/10 bg-zinc-900/20 text-zinc-500 opacity-60"
                )}
              >
                <span className="text-xs uppercase tracking-widest">Paid Session</span>
              </button>
            </div>
          </FormSection>
        </motion.div>

        {/* 6. Submit Button */}
        <motion.div variants={itemVariants} className="pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={createClassMutation.isPending}
            className={cn(
              "w-full h-20 rounded-full text-xl font-black uppercase tracking-widest gap-4 transition-all",
              "bg-zinc-950 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.25)] text-white hover:bg-zinc-900"
            )}
          >
            <Send size={24} className="fill-white" />
            {createClassMutation.isPending ? "SUBMITTING..." : "Submit Request"}
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-50">
        <NavItem icon={<Home />} label="Home" onClick={() => navigate(PATHS.TEACHER_DASHBOARD)} />
        <NavItem icon={<BookOpen />} label="Classes" active onClick={() => navigate(PATHS.TEACHER_CLASSES)} />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate(PATHS.TEACHER_WALLET)} />
        <NavItem icon={<Library />} label="Library" onClick={() => navigate(PATHS.TEACHER_LIBRARY)} />
        <NavItem icon={<User />} label="Profile" onClick={() => navigate(PATHS.TEACHER_PROFILE)} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300",
      active ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"
    )}
  >
    <div className={cn("relative", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="navDot" className="w-1 h-1 rounded-full bg-cyan-400" />}
  </button>
);

export default CreateLiveClassRequest;