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

  rechargeWallet: async (payload: { amount: number; points: number; aiCredits: number; humanChatCredits: number; redeemedPoints?: number }) => {
    const { data } = await apiClient.post("/student/wallet/recharge", payload);
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
    const { data } = await apiClient.post("/student/doubt", payload);
    return data;
  },

  cancelDoubtRequest: async (requestId: string) => {
    const { data } = await apiClient.post(`/student/doubts/${requestId}/cancel`);
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

  getStats: async (timeframe?: string) => {
    const { data } = await apiClient.get("/student/stats", { params: { timeframe } });
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

  getDailyMcq: async (classQuery?: string) => {
    const { data } = await apiClient.get("/student/mcq/daily", {
      params: { class: classQuery }
    });
    return data;
  },

  generateDailyMcq: async () => {
    const { data } = await apiClient.post("/student/mcq/generate");
    return data;
  },

  getMcqHistory: async () => {
    const { data } = await apiClient.get("/student/mcq/history");
    return data;
  },

  getLeaderboard: async (type?: string) => {
    const { data } = await apiClient.get("/student/leaderboard", {
      params: { type }
    });
    return data;
  },

  submitMcq: async (taskId: string, answers: { questionIndex: number; selectedAnswer: number }[]) => {
    const { data } = await apiClient.post("/student/mcq/submit", { taskId, answers });
    return data;
  },

  getResources: async (params?: { subject?: string; type?: string }) => {
    const { data } = await apiClient.get("/student/resources", { params });
    return data;
  },

  getStudentSubjects: async () => {
    const { data } = await apiClient.get("/student/resources/subjects");
    return data;
  },

  getActiveBanners: async () => {
    const { data } = await apiClient.get("/student/banners");
    return data;
  },

  getOnboardingSlides: async () => {
    const { data } = await apiClient.get("/student/onboarding-slides");
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

  getAgoraToken: async (sessionId: string) => {
    const { data } = await apiClient.get(`/student/sessions/${sessionId}/agora-token`);
    return data.data;
  },

  deductSessionCredits: async (sessionId: string) => {
    const { data } = await apiClient.post(`/student/sessions/${sessionId}/deduct-credits`);
    return data;
  },

  createDoubt: async (payload: {
    subject: string;
    class?: string;
    board?: string;
    language?: string;
    sessionType: "chat" | "audio" | "video" | "ai";
    doubtText?: string;
    doubtImage?: string;
    topic?: string;
  }) => {
    const { data } = await apiClient.post("/student/doubt", payload);
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
    const { data } = await apiClient.post(`/student/sessions/${feedbackData.sessionId}/resolve`, payload);
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

  uploadProfilePhoto: async (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    const { data } = await apiClient.post("/student/profile/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getAiChatHistory: async (sessionId?: string) => {
    const { data } = await apiClient.get("/student/ai-chat/history", {
      params: { sessionId }
    });
    return data;
  },

  getAiChatSessions: async () => {
    const { data } = await apiClient.get("/student/ai-chat/sessions");
    return data;
  },

  deleteAiChatSession: async (sessionId: string) => {
    const { data } = await apiClient.delete(`/student/ai-chat/session/${sessionId}`);
    return data;
  },

  clearAllAiChatHistory: async () => {
    const { data } = await apiClient.delete("/student/ai-chat/history");
    return data;
  },

  sendAiChatMessage: async (query: string, sessionId: string, imageInput?: File | string) => {
    const form = new FormData();
    form.append("query", query);
    form.append("sessionId", sessionId);
    if (imageInput) {
      if (typeof imageInput === "string") {
        form.append("imageUrl", imageInput); // Send as string parameter
      } else {
        form.append("image", imageInput); // Send as file
      }
    }
    const { data } = await apiClient.post("/student/ai-chat", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
  
  markAllNotificationsRead: async () => {
    const { data } = await apiClient.put("/student/notifications/read-all");
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

  uploadChatMedia: async (formData: FormData) => {
    const { data } = await apiClient.post('/student/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  resolveSession: async (sessionId: string) => {
    const { data } = await apiClient.post(`/student/sessions/${sessionId}/resolve`);
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

  likeVideo: async (id: string) => {
    const { data } = await apiClient.post(`/student/videos/${id}/like`);
    return data;
  },

  viewVideo: async (id: string) => {
    const { data } = await apiClient.post(`/student/videos/${id}/view`);
    return data;
  },

  shareVideo: async (id: string) => {
    const { data } = await apiClient.post(`/student/videos/${id}/share`);
    return data;
  },

  getVideoComments: async (id: string) => {
    const { data } = await apiClient.get(`/student/videos/${id}/comments`);
    return data;
  },

  addVideoComment: async (payload: { id: string; text: string }) => {
    const { data } = await apiClient.post(`/student/videos/${payload.id}/comment`, { text: payload.text });
    return data;
  },

  deleteVideoComment: async (payload: { id: string; commentId: string }) => {
    const { data } = await apiClient.delete(`/student/videos/${payload.id}/comment/${payload.commentId}`);
    return data;
  },

  getPublicProfile: async (id: string) => {
    const { data } = await apiClient.get(`/student/social/profile/${id}`);
    return data;
  },

  editPublicProfile: async (payload: { nickname?: string; bio?: string; profilePhoto?: string }) => {
    const { data } = await apiClient.put(`/student/social/profile`, payload);
    return data;
  },

  followUser: async (id: string) => {
    const { data } = await apiClient.post(`/student/social/profile/${id}/follow`);
    return data;
  },

  checkUsernameAvailability: async (username: string) => {
    const { data } = await apiClient.get("/student/social/username/check", { params: { username } });
    return data;
  },

  createPublicProfileUsername: async (username: string) => {
    const { data } = await apiClient.post("/student/social/username", { username });
    return data;
  },

  getReferral: async () => {
    const { data } = await apiClient.get("/student/referral");
    return data;
  },
  claimSpinReward: async (payload?: { rewardType?: string; amount?: number }) => {
    const { data } = await apiClient.post("/student/spin", payload || {});
    return data;
  },
  getSpinSettings: async () => {
    const { data } = await apiClient.get("/student/spin-settings");
    return data;
  },
  submitUsageHeartbeat: async () => {
    const { data } = await apiClient.post("/student/usage-heartbeat");
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
