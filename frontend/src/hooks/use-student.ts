import { useMutation, useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import type { StudentProfile, Subscription, DashboardData, Plan, Session } from "@/types";

export function useCreateProfile() {
  return useMutation<any, Error, { fullName: string; nickname: string; className: string; board: string; city: string; state: string }>({
    mutationFn: (payload) => studentApi.createProfile(payload),
  });
}

export function useStudentProfile() {
  return useQuery<StudentProfile>({
    queryKey: ["studentProfile"],
    queryFn: studentApi.getProfile,
  });
}

export function useUpdateProfile() {
  return useMutation<any, Error, any>({
    mutationFn: (payload) => studentApi.updateProfile(payload),
  });
}

export function useDashboard() {
  const isBypass = localStorage.getItem("dev_bypass_auth") === "true";
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: isBypass
      ? async () => ({
          user: {
            name: "Rahul",
            fullName: "Rahul Sharma",
            rank: "12",
            points: "1,250",
          },
          mcq: {
            completed: 8,
            total: 10,
          },
          liveClass: {
            topic: "Introduction to Quadratic Equations",
            time: "Today, 4:00 PM",
            teacher: "Dr. Alok Pandey",
            sessionId: "session-123",
            timer: "15:00",
          },
          shortLiveSessions: [
            {
              id: "short-1",
              tutor: "Sonia Sen",
              rating: "4.8",
              viewers: "1.2k",
              topic: "Newton's Laws of Motion - Quick Hack",
              rate: "Free",
              desc: "Quick revision of the three laws with real-life examples and shortcut formulas.",
            },
            {
              id: "short-2",
              tutor: "Amit Verma",
              rating: "4.9",
              viewers: "850",
              topic: "Integration Basics in 10 Mins",
              rate: "Free",
              desc: "Learn integration by parts with simple shortcuts.",
            }
          ],
        })
      : studentApi.getDashboard,
  });
}

export function useLiveClasses<T = any>() {
  return useQuery<T>({
    queryKey: ["liveClasses"],
    queryFn: studentApi.getLiveClasses,
  });
}

export function usePlans(classQuery?: string) {
  return useQuery<Plan[]>({
    queryKey: ["plans", classQuery],
    queryFn: () => studentApi.getPlans(classQuery),
  });
}

export function useActivateTrial() {
  return useMutation<any, Error, any>({
    mutationFn: () => studentApi.activateTrial(),
  });
}

export function useSessionDetails(sessionId?: string) {
  return useQuery<Session>({
    queryKey: ["sessionDetails", sessionId],
    queryFn: () => studentApi.getSessionDetails(sessionId ?? ""),
    enabled: Boolean(sessionId),
  });
}

export function useMySubscription() {
  return useQuery<Subscription>({
    queryKey: ["mySubscription"],
    queryFn: studentApi.getMySubscription,
  });
}

export function useSessionMessages(sessionId?: string) {
  return useQuery<any[]>({
    queryKey: ["sessionMessages", sessionId],
    queryFn: () => studentApi.getSessionMessages(sessionId ?? ""),
    enabled: Boolean(sessionId),
  });
}
