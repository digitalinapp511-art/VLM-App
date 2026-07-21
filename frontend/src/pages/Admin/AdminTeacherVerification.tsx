import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, FileText, ExternalLink, CheckCircle2, XCircle, Video, Loader2, CreditCard, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminVerificationPayoutApi } from '@/lib/admin-verification-payout-api';
import { useNavigate } from 'react-router-dom';

const AdminTeacherVerification: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [approvedClasses, setApprovedClasses] = useState<string[]>(['9', '10', '11', '12']);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: pendingTeachers, isLoading } = useQuery({
    queryKey: ['adminPendingTeachers'],
    queryFn: adminVerificationPayoutApi.getPendingVerifications,
  });

  const decisionMutation = useMutation({
    mutationFn: adminVerificationPayoutApi.submitVerificationDecision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingTeachers'] });
      setSelectedTeacher(null);
    },
  });

  const toggleClassSelect = (cls: string) => {
    if (approvedClasses.includes(cls)) {
      setApprovedClasses(approvedClasses.filter((c) => c !== cls));
    } else {
      setApprovedClasses([...approvedClasses, cls]);
    }
  };

  const handleDecision = (decision: 'approve' | 'reject') => {
    if (!selectedTeacher) return;
    decisionMutation.mutate({
      teacherId: selectedTeacher._id,
      decision,
      approvedClasses: decision === 'approve' ? approvedClasses : [],
      rejectionReason,
      notes: adminNotes,
      interviewId: selectedTeacher.interviews?.[0]?._id,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teacher Verification & Interview Approvals</h1>
            <p className="text-xs text-zinc-400">Review teacher ID proofs, conduct Agora interviews, and grant grade verification</p>
          </div>
          <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            {pendingTeachers?.length || 0} Pending Applications
          </span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Teachers Queue */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Pending Applicants Queue</h2>

            {(!pendingTeachers || pendingTeachers.length === 0) && (
              <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-zinc-500 text-xs">
                No pending teacher verification applications right now.
              </div>
            )}

            {pendingTeachers?.map((teacher: any) => (
              <div
                key={teacher._id}
                onClick={() => {
                  setSelectedTeacher(teacher);
                  setApprovedClasses(teacher.classes || ['9', '10', '11', '12']);
                }}
                className={cn(
                  'p-4 rounded-2xl border cursor-pointer transition flex justify-between items-center',
                  selectedTeacher?._id === teacher._id
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                )}
              >
                <div>
                  <h3 className="font-bold text-sm">{teacher.firstName} {teacher.lastName}</h3>
                  <p className="text-xs text-zinc-400">{teacher.userId?.email || teacher.email}</p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-1">ID: {teacher.vlmTeacherId || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full capitalize">
                    {teacher.applicationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Teacher Details & Actions */}
          <div className="lg:col-span-2">
            {selectedTeacher ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedTeacher.firstName} {selectedTeacher.lastName}</h2>
                    <p className="text-xs text-zinc-400">{selectedTeacher.userId?.email} | Mobile: {selectedTeacher.userId?.mobile || 'N/A'}</p>
                  </div>
                  {selectedTeacher.interviews?.[0] && (
                    <Button
                      onClick={() => navigate(`/teacher/interview-room/${selectedTeacher.interviews[0]._id}`)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs gap-2"
                    >
                      <Video size={16} /> Join Agora Interview Room
                    </Button>
                  )}
                </div>

                {/* Uploaded Documents */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                    <FileText size={16} /> Uploaded Document Proofs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedTeacher.documents?.map((doc: any) => (
                      <a
                        key={doc._id}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-black/40 border border-white/10 rounded-xl hover:border-cyan-500/50 transition flex justify-between items-center text-xs"
                      >
                        <span className="truncate capitalize">{doc.type}</span>
                        <ExternalLink size={14} className="text-cyan-400 shrink-0" />
                      </a>
                    )) || <p className="text-xs text-zinc-500">No document records found.</p>}
                  </div>
                </div>

                {/* Bank Account Information */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                    <CreditCard size={16} /> Bank Account & Payout Details
                  </h3>
                  <div className="bg-black/40 border border-white/10 p-4 rounded-2xl grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-zinc-500">Account Holder:</span> <p className="font-semibold">{selectedTeacher.bankDetails?.accountHolder || 'N/A'}</p></div>
                    <div><span className="text-zinc-500">Account Number:</span> <p className="font-semibold font-mono">{selectedTeacher.bankDetails?.accountNumber || 'N/A'}</p></div>
                    <div><span className="text-zinc-500">IFSC Code:</span> <p className="font-semibold font-mono">{selectedTeacher.bankDetails?.ifsc || 'N/A'}</p></div>
                    <div><span className="text-zinc-500">Bank Name:</span> <p className="font-semibold">{selectedTeacher.bankDetails?.bankName || 'N/A'}</p></div>
                  </div>
                </div>

                {/* Class Verification Assignment */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                    <Award size={16} /> Assign Verified Grade Tiers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['6', '7', '8', '9', '10', '11', '12'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleClassSelect(cls)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-xs font-semibold border transition',
                          approvedClasses.includes(cls)
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-black/40 border-white/10 text-zinc-500'
                        )}
                      >
                        Class {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback / Rejection Notes */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-1 block">Admin Feedback / Interview Notes</label>
                  <Input
                    placeholder="Enter notes or reason if rejecting..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-black/40 border-white/10 text-white"
                  />
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex gap-4 pt-2 border-t border-white/10">
                  <Button
                    onClick={() => handleDecision('reject')}
                    disabled={decisionMutation.isPending}
                    variant="outline"
                    className="flex-1 border-rose-500/50 text-rose-400 hover:bg-rose-500/10 gap-2"
                  >
                    <XCircle size={16} /> Reject Application
                  </Button>
                  <Button
                    onClick={() => handleDecision('approve')}
                    disabled={decisionMutation.isPending}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold gap-2 text-white"
                  >
                    <CheckCircle2 size={16} /> Approve & Verify Teacher
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 bg-white/5 border border-white/10 rounded-3xl text-zinc-500 text-sm">
                Select an applicant from the left queue to review ID proof documents and conduct interview approval.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherVerification;
