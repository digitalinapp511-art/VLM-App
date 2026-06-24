import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";
import { toast } from "sonner";

import { DaySelector, SubjectChip } from "@/components/basic/teacher//AvailabilitySelectors";
import TimeSlotCard from "@/components/basic/teacher/TimeSlotCard";

const TimeSlotAvailability: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState("WED");
  const [selectedSub, setSelectedSub] = useState("Maths");
  const [repeatWeekly, setRepeatWeekly] = useState(true);

  const days = ["M", "T", "WED", "T", "F", "S", "S"];
  const subjects = ["Maths", "Physics", "Chemistry", "Biology"];

  // Fetch existing slots
  const { data: existingSlots = [], refetch } = useQuery({
    queryKey: ["teacherTimeSlots"],
    queryFn: () => teacherApi.getTimeSlots(),
  });

  const saveMutation = useMutation({
    mutationFn: () => teacherApi.saveTimeSlots(
      existingSlots.map((s: any) => ({
        dayOfWeek: s.dayOfWeek,
        subject: s.subject,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      repeatWeekly
    ),
    onSuccess: () => { toast.success("Schedule saved!"); refetch(); },
    onError: () => toast.error("Failed to save schedule"),
  });

  return (
    <div className={cn("min-h-screen flex flex-col p-6 pb-12", bgCss)}>
      {/* Header */}
      <header className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:opacity-70">
          <ChevronLeft size={28} />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold text-blue-300/80 uppercase tracking-widest mr-7">
          Time Slot Availability
        </h1>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Selection Area */}
        <div className="space-y-4">
          <DaySelector days={days} selectedDay={selectedDay} onSelect={setSelectedDay} />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {subjects.map((sub) => (
              <SubjectChip
                key={sub}
                label={sub}
                isActive={selectedSub === sub}
                onClick={() => setSelectedSub(sub)}
              />
            ))}
          </div>
        </div>

        {/* Add New Slot Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 rounded-[28px] border-2 border-dashed border-blue-400/40 bg-blue-400/5 text-zinc-100 font-bold flex items-center justify-center gap-2 hover:bg-blue-400/10 transition-all"
        >
          <Plus size={20} />
          Add New Time Slot
        </motion.button>

        {/* Slots List — show DB slots or fallback sample */}
        <div className="space-y-4">
          {existingSlots.length > 0 ? (
            existingSlots.map((slot: any, i: number) => (
              <TimeSlotCard
                key={slot.id}
                slotNumber={i + 1}
                startTime={slot.startTime}
                endTime={slot.endTime}
                subject={slot.subject}
                variant={["cyan", "purple", "blue"][i % 3] as any}
              />
            ))
          ) : (
            <>
              <TimeSlotCard slotNumber={1} startTime="09:00 AM" endTime="10:00 AM" subject="Maths" variant="cyan" />
              <TimeSlotCard slotNumber={2} startTime="11:30 AM" endTime="12:30 PM" subject="Physics" variant="purple" />
              <TimeSlotCard slotNumber={3} startTime="15:00 PM" endTime="16:00 PM" subject="Maths" variant="blue" />
            </>
          )}
        </div>

        {/* Options */}
        <div className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-between">
          <span className="text-white font-medium">Repeat Schedule Weekly</span>
          <Switch
            checked={repeatWeekly}
            onCheckedChange={setRepeatWeekly}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {/* Info Text */}
        <p className="text-zinc-500 text-xs text-center leading-relaxed px-4">
          Set your preferred teaching hours. These will be visible to students for bookings.
          Overlapping or conflicting slots will be flagged.
        </p>

        {/* Action Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className={cn(
              "w-full h-16 rounded-full text-lg font-bold transition-all",
              "bg-gradient-to-r from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
              "border border-white/10 shadow-2xl text-white flex items-center justify-center gap-2"
            )}
          >
            {saveMutation.isPending ? "Saving..." : "Save & Apply Schedule >"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TimeSlotAvailability;