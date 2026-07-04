// src/pages/AddChild.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Info } from "lucide-react";

import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { PATHS } from "@/routes/paths";

import { InputSection } from "@/components/basic/parent/InputSection";
import { QRSection } from "@/components/basic/parent/QRSection";
import { SendRequestButton } from "@/components/basic/parent/SendRequestButton";

export default function AddChild() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!studentId.trim() && !studentMobile.trim()) {
      toast.error("Please enter either Student ID or Mobile Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/parent/link-child", {
        studentId: studentId.trim() || undefined,
        studentMobile: studentMobile.trim() || undefined,
      });

      if (response.data?.success) {
        toast.success(response.data?.message || "Link request sent successfully!");
        navigate(PATHS.PARENT_PENDING_APPROVAL);
      } else {
        toast.error(response.data?.message || "Failed to link child.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Student not found.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQrScan = async () => {
    const scannedId = prompt("Scan QR Code (Simulated):\n\nPlease enter the child's Student ID:");
    if (!scannedId || !scannedId.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/parent/link-child", {
        studentId: scannedId.trim(),
        isQrScan: true
      });

      if (response.data?.success) {
        toast.success("Child linked and approved successfully via QR scan!");
        navigate(PATHS.PARENT_DASHBOARD);
      } else {
        toast.error(response.data?.message || "Failed to link child.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Student not found.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(bgCss, "min-h-screen w-full flex flex-col items-center px-4 py-3 bg-[#050505] overflow-x-hidden justify-between")}>
      
      {/* --- HEADER --- */}
      <header className="w-full max-w-xl relative flex flex-col items-center pt-2 pb-4">
        <div className="absolute left-0 top-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center mt-1">
          <h2 className="text-xl font-bold tracking-[0.15em] text-[#D4AF37] mb-0.5" style={{ fontFamily: 'Cinzel, serif' }}>
            VLMACADEMY
          </h2>
          <p className="text-[8px] tracking-[0.4em] font-bold text-[#D4AF37]/80 uppercase">
            Parent Module
          </p>
        </div>

        <h1 className="mt-4 text-xl font-bold text-white tracking-tight">
          Add Your Child
        </h1>
      </header>

      {/* --- CONTENT CARD --- */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative flex-1 flex flex-col justify-center"
      >
        {/* Subtle purple glow effect on card edge */}
        <div className="absolute -right-4 top-1/4 w-1 h-24 bg-purple-500/20 blur-xl rounded-full" />

        <Card className="border-white/5 bg-[#1a1a1a]/40 backdrop-blur-3xl rounded-3xl shadow-2xl">
          <CardContent className="p-4 sm:p-6 space-y-4">
            
            <InputSection 
              type="id"
              label="Enter Student VLM ID"
              placeholder="e.g., VLM-STU-000001"
              value={studentId}
              onChange={setStudentId}
            />

            <Divider />

            <InputSection 
              type="mobile"
              label="Enter Mobile Number"
              placeholder="Enter child's school number"
              value={studentMobile}
              onChange={setStudentMobile}
            />

            <Divider />

            <QRSection onScan={handleQrScan} />

          </CardContent>
        </Card>

        {/* --- FOOTER ACTION --- */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <SendRequestButton onClick={handleSubmit} />
          
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-medium">
            <span>Child approval required</span>
            <Info size={12} />
          </div>
        </div>
      </motion.main>
    </div>
  );
}

const Divider = () => (
  <div className="flex items-center gap-4 px-2">
    <div className="h-[1px] flex-1 bg-white/10" />
    <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest">or</span>
    <div className="h-[1px] flex-1 bg-white/10" />
  </div>
);