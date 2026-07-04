import { apiClient } from "@/lib/api-client";
import type { StudentProfile, Subscription, DashboardData, Session } from "@/types";

export const studentApi = {
  getReferralData: async () => {
    const { data } = await apiClient.get("/student/referral");
    return data;
  },

  getWalletHistory: async () => {
    const { data } = await apiClient.get("/student/wallet/history");
    return data.data || data;
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
    const { data } = await apiClient.post("/student/doubt", payload);
    return data;
  },

  submitDoubtWithImages: async (formData: FormData) => {
    // Falls back to /student/doubts/upload if backend handles it separately. 
    // Otherwise keep as is, if backend supports it.
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

  getPlans: async (classQuery?: string) => {
    const { data } = await apiClient.get("/student/plans", { params: { class: classQuery || "10" } });
    return data;
  },

  getDailyMcq: async () => {
    const { data } = await apiClient.get("/student/mcq/daily");
    return data;
  },

  submitMcq: async (questionId: string, answer: any) => {
    const { data } = await apiClient.post("/student/mcq/submit", { questionId, answer });
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
    if (!feedbackData.sessionId || String(feedbackData.sessionId).startsWith("mock-")) {
      return { success: true };
    }
    const payload = {
      sessionId: feedbackData.sessionId,
      rating: feedbackData.rating,
      feedback: feedbackData.comment || "",
      categories: {
        understanding: feedbackData.rating >= 4,
        explanation: feedbackData.rating >= 4,
        interaction: feedbackData.rating >= 4,
      }
    };
    const { data } = await apiClient.post("/student/sessions/resolve", payload);
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

  activateTrial: async (planId: string) => {
    const { data } = await apiClient.post("/student/trial", { planId });
    return data;
  },

  createDoubt: async (payload: any) => {
    const { data } = await apiClient.post("/student/doubt", payload);
    return data;
  },

  createProfile: async (payload: any) => {
    const { data } = await apiClient.put("/student/profile", payload);
    return data;
  },
  getNotifications: async () => {
    const { data } = await apiClient.get("/student/notifications");
    return data;
  },

  markNotificationRead: async (id: string) => {
    const { data } = await apiClient.put(`/student/notifications/${id}/read`);
    return data;
  },

  getSessionMessages: async (sessionId: string) => {
    const { data } = await apiClient.get(`/student/sessions/${sessionId}/messages`);
    return data;
  },

  sendMessage: async (sessionId: string, content: string) => {
    const { data } = await apiClient.post(`/student/sessions/messages`, { sessionId, content });
    return data;
  },

  resolveSession: async (sessionId: string) => {
    const { data } = await apiClient.post(`/student/sessions/resolve`, { sessionId });
    return data;
  },

  createTicket: async (payload: any) => {
    const { data } = await apiClient.post("/student/tickets", payload);
    return data;
  },

  getTickets: async () => {
    const { data } = await apiClient.get("/student/tickets");
    return data;
  },

  getTicket: async (id: string) => {
    const { data } = await apiClient.get(`/student/tickets/${id}`);
    return data;
  },

  replyTicket: async (id: string, message: string) => {
    const { data } = await apiClient.post(`/student/tickets/${id}/reply`, { message });
    return data;
  },

  toggleFavoriteTeacher: async (teacherId: string) => {
    const { data } = await apiClient.post("/student/favorite-teacher", { teacherId });
    return data;
  },

  uploadShortVideo: async (formData: FormData) => {
    const { data } = await apiClient.post("/student/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },


  getVideos: async () => {
    const { data } = await apiClient.get("/student/videos");
    return data;
  },

  getMyVideos: async () => {
    const { data } = await apiClient.get("/student/videos/mine");
    return data;
  },

  getReferral: async () => {
    const { data } = await apiClient.get("/student/referral");
    return data;
  },
  claimSpinReward: async (payload: { rewardType: string; amount: number }) => {
    const { data } = await apiClient.post("/student/spin", payload);
    return data;
  },
  getParentRequests: async () => {
    const { data } = await apiClient.get("/student/parent-requests");
    return data.data || data;
  },
  approveParentRequest: async (parentId: string) => {
    const { data } = await apiClient.post(`/student/parent-requests/${parentId}/approve`);
    return data;
  },
  rejectParentRequest: async (parentId: string) => {
    const { data } = await apiClient.post(`/student/parent-requests/${parentId}/reject`);
    return data;
  },
};

export default studentApi;
