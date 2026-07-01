/**
 * teacher-api.ts
 * Centralised API calls for all Teacher-facing screens.
 * Mirrors the pattern used in student-api.ts.
 */

import { apiClient } from '@/lib/api-client';

export const teacherApi = {

  // ── Profile ─────────────────────────────────────────────────
  createProfile: async (payload: { fullName: string; qualification?: string; experience?: number }) => {
    const { data } = await apiClient.post('/teacher/profile', payload);
    return data.data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get('/teacher/profile');
    return data.data;
  },

  updateProfile: async (payload: Record<string, any>) => {
    const { data } = await apiClient.patch('/teacher/profile', payload);
    return data.data;
  },

  // ── File Uploads ─────────────────────────────────────────────
  uploadProfilePhoto: async (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    const { data } = await apiClient.post('/teacher/profile/photo', form);
    return data;
  },

  uploadDocument: async (file: File, documentType: 'aadhaar' | 'qualification' | 'experience') => {
    const form = new FormData();
    form.append('document', file);
    form.append('documentType', documentType);
    const { data } = await apiClient.post('/teacher/documents', form);
    return data;
  },

  uploadDemoVideo: async (file: File) => {
    const form = new FormData();
    form.append('video', file);
    const { data } = await apiClient.post('/teacher/demo-video', form);
    return data;
  },

  // ── Onboarding ───────────────────────────────────────────────
  submitForVerification: async () => {
    const { data } = await apiClient.post('/teacher/submit-for-verification');
    return data;
  },

  getVerificationStatus: async () => {
    const { data } = await apiClient.get('/teacher/verification-status');
    return data;
  },

  // ── Dashboard ────────────────────────────────────────────────
  getDashboard: async () => {
    const { data } = await apiClient.get('/teacher/dashboard');
    return data.data;
  },

  // ── Availability ─────────────────────────────────────────────
  updateAvailability: async (status: 'online' | 'offline' | 'busy') => {
    const { data } = await apiClient.patch('/teacher/availability', { status });
    return data;
  },

  // ── Time Slots ───────────────────────────────────────────────
  getTimeSlots: async (day?: string) => {
    const params = day ? `?day=${day}` : '';
    const { data } = await apiClient.get(`/teacher/time-slots${params}`);
    return data.slots;
  },

  saveTimeSlots: async (slots: Array<{
    dayOfWeek: string;
    subject: string;
    startTime: string;
    endTime: string;
  }>, repeatWeekly = true) => {
    const { data } = await apiClient.post('/teacher/time-slots', { slots, repeatWeekly });
    return data;
  },

  // ── Notifications ────────────────────────────────────────────
  getNotifications: async () => {
    const { data } = await apiClient.get('/teacher/notifications');
    return data.notifications;
  },

  markNotificationRead: async (id: string) => {
    const { data } = await apiClient.patch(`/teacher/notifications/${id}/read`);
    return data;
  },

  getWallet: async () => {
    const { data } = await apiClient.get('/teacher/wallet');
    return data.data;
  },

  // ── Sessions ─────────────────────────────────────────────────
  getSessions: async (params?: { status?: string; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    const { data } = await apiClient.get(`/teacher/sessions?${q.toString()}`);
    return data.sessions;
  },

  acceptSessionRequest: async (sessionId: string) => {
    const { data } = await apiClient.post(`/teacher/session/${sessionId}/accept`);
    return data;
  },

  declineSessionRequest: async (sessionId: string) => {
    const { data } = await apiClient.post(`/teacher/session/${sessionId}/decline`);
    return data;
  },

  endSession: async (sessionId: string) => {
    const { data } = await apiClient.patch(`/teacher/session/${sessionId}/end`);
    return data;
  },

  // ── Doubts ───────────────────────────────────────────────────
  getDoubts: async (status?: string) => {
    const q = status ? `?status=${status}` : '';
    const { data } = await apiClient.get(`/teacher/doubts${q}`);
    return data.doubts;
  },

  // ── Chat ─────────────────────────────────────────────────────
  getSessionChat: async (chatId: string, page = 1) => {
    const { data } = await apiClient.get(`/teacher/chat/${chatId}?page=${page}`);
    return data;
  },
};
