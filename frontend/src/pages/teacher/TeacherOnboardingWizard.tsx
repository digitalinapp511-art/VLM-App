import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import {
  FileText, CreditCard, Video, Calendar, CheckCircle2, AlertCircle, ArrowLeft, Loader2, VideoIcon, Lock
} from 'lucide-react';
import { bgCss } from '@/helper/CssHelper';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '@/lib/teacher-api';

const TeacherOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(1);

  // Form states
  const [aadhaarUrl, setAadhaarUrl] = useState('');
  const [qualificationUrl, setQualificationUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');

  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');

  const [scheduledAt, setScheduledAt] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['teacherVerificationStatus'],
    queryFn: teacherApi.getVerificationStatus,
  });

  const submitDocsMutation = useMutation({
    mutationFn: teacherApi.submitVerificationDocs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherVerificationStatus'] });
      setStep(3);
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: teacherApi.scheduleInterviewSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherVerificationStatus'] });
      setStep(4);
    },
  });

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDocsMutation.mutate({
      documents: [
        { type: 'aadhaar', name: 'Aadhaar / ID Proof', url: aadhaarUrl || 'https://via.placeholder.com/aadhaar.png' },
        { type: 'qualificationCert', name: 'Degree Certificate', url: qualificationUrl || 'https://via.placeholder.com/degree.png' },
        { type: 'resume', name: 'Resume', url: resumeUrl || 'https://via.placeholder.com/resume.pdf' },
      ],
      bankDetails: {
        accountHolder,
        accountNumber,
        ifsc,
        bankName,
        upiId,
      },
      demoVideoUrl,
    });
  };

  const handleInterviewSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;
    scheduleInterviewMutation.mutate({
      scheduledAt,
      teacherNotes,
      type: 'onboarding',
    });
  };

  if (isLoading) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center text-white', bgCss)}>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const isVerified = statusData?.isApproved;
  const interview = statusData?.interview;

  return (
    <div className={cn('min-h-screen flex flex-col items-center p-4 pb-20 relative overflow-y-auto', bgCss)}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl mt-6 text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(PATHS.TEACHER_PROFILE)}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition text-zinc-300"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Teacher Onboarding Verification</h1>
              <p className="text-xs text-zinc-400">Complete verification documents & schedule your admin interview</p>
            </div>
          </div>
          {isVerified ? (
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
              <CheckCircle2 size={14} /> Verified Teacher
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold">
              <Lock size={14} /> Verification Pending
            </span>
          )}
        </div>

        {/* Step Stepper */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { id: 1, label: 'Docs & ID' },
            { id: 2, label: 'Bank Details' },
            { id: 3, label: 'Interview Slot' },
            { id: 4, label: 'Status' },
          ].map((s) => (
            <div
              key={s.id}
              onClick={() => setStep(s.id)}
              className={cn(
                'cursor-pointer py-2 px-1 text-center rounded-xl text-xs font-medium border transition',
                step === s.id
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : step > s.id
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/5 text-zinc-500'
              )}
            >
              {s.id}. {s.label}
            </div>
          ))}
        </div>

        {/* Step 1: ID & Documents */}
        {step === 1 && (
          <form onSubmit={() => setStep(2)} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
              <FileText size={18} /> Step 1: Identity & Verification Proofs
            </h3>

            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1 block">Aadhaar / Passport / Govt ID URL (PDF or Image)</label>
              <Input
                placeholder="https://cloud.storage/aadhaar.pdf or aadhaar.png"
                value={aadhaarUrl}
                onChange={(e) => setAadhaarUrl(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1 block">Highest Degree / Certification Document URL (PDF or Image)</label>
              <Input
                placeholder="https://cloud.storage/degree.pdf or degree.jpg"
                value={qualificationUrl}
                onChange={(e) => setQualificationUrl(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1 block">Resume / Curriculum Vitae URL (PDF or Image)</label>
              <Input
                placeholder="https://cloud.storage/resume.pdf or resume.png"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1 block">Short Demo Video Pitch URL (1-2 mins)</label>
              <Input
                placeholder="https://cloud.storage/intro-video.mp4"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
              />
            </div>

            <Button type="button" onClick={() => setStep(2)} className="w-full bg-cyan-500 hover:bg-cyan-600 font-semibold mt-4">
              Next: Payout Details &rarr;
            </Button>
          </form>
        )}

        {/* Step 2: Bank / UPI Details */}
        {step === 2 && (
          <form onSubmit={handleDocumentSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
              <CreditCard size={18} /> Step 2: Weekly Payout Account Details
            </h3>

            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1 block">Account Holder Full Name</label>
              <Input
                placeholder="Name as on Bank Account"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-300 font-medium mb-1 block">Bank Account Number</label>
                <Input
                  placeholder="e.g. 918234908234"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium mb-1 block">IFSC Code</label>
                <Input
                  placeholder="e.g. SBIN0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-300 font-medium mb-1 block">Bank Name</label>
                <Input
                  placeholder="State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium mb-1 block">UPI ID (Optional)</label>
                <Input
                  placeholder="teacher@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-white/10 text-zinc-300">
                &larr; Back
              </Button>
              <Button
                type="submit"
                disabled={submitDocsMutation.isPending}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 font-semibold"
              >
                {submitDocsMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save & Continue to Interview'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Schedule Interview */}
        {step === 3 && (
          <form onSubmit={handleInterviewSchedule} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-400">
              <Calendar size={18} /> Step 3: Schedule Admin Verification Interview
            </h3>

            <p className="text-xs text-zinc-400">
              Select a date and time for your 1-on-1 Agora video verification interview with our Admin / Lead Teacher team.
            </p>

            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1 block">Date & Time Slot</label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1 block">Notes / Special Instructions for Interviewer</label>
              <textarea
                placeholder="Mention subject specialties or preferred times..."
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="border-white/10 text-zinc-300">
                &larr; Back
              </Button>
              <Button
                type="submit"
                disabled={scheduleInterviewMutation.isPending}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 font-semibold"
              >
                {scheduleInterviewMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm Interview Booking'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Final Status & Agora Call Room Button */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mx-auto">
              {isVerified ? <CheckCircle2 size={32} /> : <VideoIcon size={32} />}
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {isVerified ? 'You are a Verified Teacher!' : 'Verification Interview Scheduled'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                {isVerified
                  ? 'Your profile, ID proofs, and interview have been approved. You can now toggle your online status to receive live call requests from students.'
                  : 'Your onboarding materials have been received. Join the Agora video call below at your scheduled interview time.'}
              </p>
            </div>

            {interview && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Scheduled Time:</span>
                  <span className="text-cyan-300 font-semibold">{new Date(interview.scheduledAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Interview Status:</span>
                  <span className="capitalize text-amber-400 font-semibold">{interview.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Agora Room:</span>
                  <span className="font-mono text-xs text-zinc-300">{interview.agoraChannelName}</span>
                </div>
              </div>
            )}

            {!isVerified && interview && (
              <div className="pt-2">
                <Button
                  onClick={() => navigate(`/teacher/interview-room/${interview._id}`)}
                  className="bg-emerald-500 hover:bg-emerald-600 font-bold px-8 py-3 rounded-xl gap-2 text-sm shadow-lg shadow-emerald-500/20"
                >
                  <Video size={18} /> Join Agora Verification Room
                </Button>
              </div>
            )}

            {isVerified && (
              <div className="pt-2">
                <Button
                  onClick={() => navigate(PATHS.TEACHER_PROFILE)}
                  className="bg-cyan-500 hover:bg-cyan-600 font-bold px-8 py-3 rounded-xl text-sm"
                >
                  Go to Teacher Dashboard & Live Status
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeacherOnboardingWizard;
