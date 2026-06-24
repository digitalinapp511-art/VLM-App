import { apiClient } from "@/lib/api-client";
import type { StudentProfile, Subscription, DashboardData, Session } from "@/types";

export const studentApi = {
  getReferralData: async () => {
    const { data } = await apiClient.get("/student/referral-data");
    return data;
  },

  getSubjectsFull: async (className?: string) => {
    const { data } = await apiClient.get("/student/subjects", {
      params: { class: className },
    });
    return data;
  },

  getSubjectsWithIds: async () => {
    const { data } = await apiClient.get("/student/subjects-with-ids");
    return data;
  },

  getChaptersBySubjectName: async (subjectName: string) => {
    const { data } = await apiClient.get("/student/chapters", {
      params: { subject: subjectName },
    });
    return data;
  },

  submitDoubt: async (payload: any) => {
    const { data } = await apiClient.post("/student/doubts", payload);
    return data;
  },

  submitDoubtWithImages: async (formData: FormData) => {
    const { data } = await apiClient.post("/student/doubts/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getReferralHistory: async () => {
    const { data } = await apiClient.get("/student/referrals/history");
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get("/student/stats");
    return data;
  },

  getOrderSummary: async (planId: string) => {
    const { data } = await apiClient.get(`/student/orders/${planId}`);
    return data;
  },

  createPaymentOrder: async (planId: string) => {
    const { data } = await apiClient.post(`/student/payment-orders`, { planId });
    return data;
  },

  getPlans: async () => {
    const { data } = await apiClient.get("/student/plans");
    return data;
  },

  getDailyMcq: async () => {
    const { data } = await apiClient.get("/student/mcq/daily");
    return data;
  },

  submitMcqAttempt: async (questionId: string, answer: any) => {
    const { data } = await apiClient.post("/student/mcq/attempt", { questionId, answer });
    return data;
  },

  getAvailableTeachers: async (params: { limit?: number }) => {
    const { data } = await apiClient.get("/student/teachers", { params });
    return data;
  },

  getMySessions: async () => {
    const { data } = await apiClient.get("/student/sessions");
    return data;
  },

  getDoubtById: async (doubtId: string) => {
    const { data } = await apiClient.get(`/student/doubts/${doubtId}`);
    return data;
  },

  submitFeedback: async (feedbackData: any) => {
    const { data } = await apiClient.post("/student/feedback", feedbackData);
    return data;
  },

  getDashboard: async () => {
    const { data } = await apiClient.get<DashboardData>("/student/dashboard");
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get<StudentProfile>("/student/profile");
    return data;
  },

  updateProfile: async (payload: any) => {
    const { data } = await apiClient.put("/student/profile", payload);
    return data;
  },

  getLiveClasses: async () => {
    const { data } = await apiClient.get("/student/live-classes");
    return data;
  },

  getSessionDetails: async (sessionId: string) => {
    const { data } = await apiClient.get<Session>(`/student/sessions/${sessionId}`);
    return data;
  },

  getMySubscription: async () => {
    const { data } = await apiClient.get<Subscription>("/student/subscription");
    return data;
  },

  activateTrial: async () => {
    const { data } = await apiClient.post("/student/subscription/trial");
    return data;
  },

  createProfile: async (payload: any) => {
    const { data } = await apiClient.post("/student/profile", payload);
    return data;
  },
};

export default studentApi;
