export type Role = "student" | "parent" | "teacher";

export interface RoleOption {
  id: Role;
  label: string;
  description: string;
  icon: string; // lucide icon name
}

export interface LoginPayload {
  phone?: string;
  email?: string;

  password?: string;

  role?: Role;
}

export interface VerifyOtpResponse {
  message: string;
  accessToken: string;
  isNewUser: boolean;
  user: {
    id: string;
    email: string | null;
    mobile: string | null;
    role: string;
    studentProfile?: unknown;
    parentProfile?: unknown;
    teacherProfile?: unknown;
  };

}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  token: string;
  isNewUser?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  credits?: string;
  humanChatCredits?: string;
  audioVideoMinutes?: string;
  liveClassAcess?: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  nickname?: string | null;
  className?: string | null;
  board?: string | null;
  schoolName?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface Subscription {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  plan?: Plan;
}

export interface Session {
  id: string;
  type: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  teacher?: { fullName: string; qualification?: string | null; rating?: number };
  student?: { fullName: string };
  topic?: string;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  qualification?: string | null;
  rating: number;
}

export interface DashboardData {
  user: { name: string; fullName?: string; rank: string; points: string };
  mcq: { completed: number; total: number };
  liveClass: {
    topic: string;
    time: string;
    teacher: string;
    sessionId: string | null;
    timer: string;
  };
  shortLiveSessions: Array<{
    id: string;
    tutor: string;
    rating: string;
    viewers: string;
    topic: string;
    rate: string;
    desc: string;
  }>;
}
