import { apiClient } from '@/lib/api-client';

export const adminVerificationPayoutApi = {
  // Verification
  getPendingVerifications: async () => {
    const { data } = await apiClient.get('/admin/teachers/pending-verification');
    return data.data;
  },

  submitVerificationDecision: async (payload: {
    teacherId: string;
    decision: 'approve' | 'reject';
    approvedClasses?: string[];
    rejectionReason?: string;
    interviewId?: string;
    notes?: string;
  }) => {
    const { data } = await apiClient.post('/admin/teachers/verify-decision', payload);
    return data;
  },

  // Admin Interview Slot Configuration & Rescheduling
  getSlotSettings: async () => {
    const { data } = await apiClient.get('/admin/interview-slots/settings');
    return data.data;
  },

  updateSlotSettings: async (payload: { availableDays: string[]; timeSlots: string[]; maxBookingsPerSlot?: number }) => {
    const { data } = await apiClient.put('/admin/interview-slots/settings', payload);
    return data;
  },

  rescheduleInterview: async (payload: { interviewId: string; newScheduledAt: string; reason?: string }) => {
    const { data } = await apiClient.post('/admin/teachers/reschedule-interview', payload);
    return data;
  },

  // Manual Payouts
  getPendingPayouts: async () => {
    const { data } = await apiClient.get('/admin/payouts/pending');
    return data.data;
  },

  processPayout: async (payload: {
    teacherId: string;
    amount: number;
    transactionReference: string;
    notes?: string;
    periodStart?: string;
    periodEnd?: string;
  }) => {
    const { data } = await apiClient.post('/admin/payouts/process', payload);
    return data;
  },

  getPayoutHistory: async () => {
    const { data } = await apiClient.get('/admin/payouts/history');
    return data.data;
  },
};
