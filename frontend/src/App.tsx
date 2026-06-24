import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SplashPage from "@/pages/SplashPage";
import RoleSelectPage from "@/pages/RoleSelectPage";
import LoginPage from "@/pages/LoginPage";
import OtpPage from "@/pages/OtpPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import DashboardPage from "@/pages/DashboardPage";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CreateProfile from "./pages/CreateProfile";
import LearningPlan from "./pages/student/LearningPlan";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentLayout from "./components/layout/StudentLayout";
import AskDoubt from "./pages/student/AskDoubt";
import AudioCall from "./pages/student/AudioCall";
import Mcq from "./pages/student/Mcq";
import Spinner from "./pages/student/Spinner";
import LiveClasses from "./pages/student/LiveClasses";
import VideoUpload from "./pages/student/VideoUpload";
import ReferEarn from "./pages/ReferEarn";
import ReferralHistory from "./pages/student/ReferralHistory";
import LiveSession from "./pages/student/LiveSession";
import SessionFeedback from "./pages/student/SessionFeedBack";
import SessionHistory from "./pages/student/SessionHistory";
import ShortLiveSessions from "./pages/student/ShortLiveSession";
import SubjectSelection from "./pages/SubjectSelection";
import PlanScreen from "./pages/student/PlanScreen";
import PaymentFailed from "./pages/student/PaymentFailed";
import DoubtSubmitted from "./pages/student/DoubtSubmitted";
import Coupon from "./pages/student/Coupon";
import PlanUpgrade from "./pages/student/PlanUpgrade";
import ReferralReward from "./pages/student/ReferralReward";
import EditProfile from "./pages/student/EditProfile";
import { PATHS } from "@/routes/paths";
import TeacherRegistration from "./pages/teacher/TeacherRegistration";
import TeacherQualificationDetails from "./pages/teacher/TeacherQualificationDetails";
import BasicProfileDetails from "./pages/teacher/stepper/BasicProfileDetails";
import TeacherExperienceDetails from "./pages/teacher/stepper/TeacherExperienceDetails";
import TeacherClassSelection from "./pages/teacher/stepper/TeacherClassSelection";
//import TeacherSubjectSelection from "./pages/TeacherSubjectSelection";
import AddChild from "./pages/Parent/Addchild";
import LiveActivity from "./pages/Parent/LiveActivity";
import DoubtHistory from "./pages/Parent/DoubtHistory";
import BoardSelection from "./pages/teacher/stepper/BoardSelection";
import LanguageSelection from "./pages/teacher/stepper/LanguageSelection";
import DocumentUpload from "./pages/teacher/stepper/DocumentUpload";
import InterviewScheduling from "./pages/teacher/InterviewScheduling";
import TeacherDemoVideo from "./pages/teacher/TeacherDemoVideo";
import ProfileReview from "./pages/teacher/ProfileReview";
import InterviewConfirmation from "./pages/teacher/InterviewConfirmation";
import Dashboard from "./pages/teacher/Dashboard";
import AvailabilityStatus from "./pages/teacher/AvailabilityStatus";
import DirectRequestNotification from "./pages/teacher/DirectRequestNotification";
import TeacherNotifications from "./pages/teacher/Notifications";
import WalletDashboard from "./pages/teacher/WalletDashboard";
import EarningsHistory from "./pages/teacher/EarningsHistory";
import TeachSessionHistory from "./pages/teacher/TeachSessionHistory";
import RequestsPage from "./pages/teacher/RequestsPage";
import CreateLiveClassRequest from "./pages/teacher/CreateLiveClassRequest";
import RecordingLibrary from "./pages/teacher/RecordingLibrary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public auth */}
          <Route path={PATHS.SPLASH} element={<SplashPage />} />
          <Route path={PATHS.ROLE_SELECT} element={<RoleSelectPage />} />
          <Route path={PATHS.LOGIN} element={<LoginPage />} />
          <Route path={PATHS.OTP} element={<OtpPage />} />
          <Route path={PATHS.COMING_SOON} element={<ComingSoonPage />} />

          {/* Onboarding STUDENT */}
          <Route path={PATHS.CREATE_PROFILE} element={<CreateProfile />} />
          <Route path={PATHS.SUBJECT_SELECTION} element={<SubjectSelection />} />
          <Route path={PATHS.LEARNING_PLAN} element={<LearningPlan />} />
          <Route path={PATHS.COUPON} element={<Coupon />} />
          <Route path={PATHS.PLAN_SCREEN} element={<PlanScreen />} />
          <Route path={PATHS.PAYMENT_FAILED} element={<PaymentFailed />} />
          {/* Student tabs */}
          <Route element={<StudentLayout />}>
            <Route path={PATHS.STUDENT_DASHBOARD} element={<StudentDashboard />} />
            <Route path={PATHS.ASK_DOUBT} element={<AskDoubt />} />
            <Route path={PATHS.MCQ} element={<Mcq />} />
            <Route path={PATHS.LIVE_CLASSES} element={<LiveClasses />} />
            <Route path={PATHS.PROFILE} element={<EditProfile />} />
            <Route path={PATHS.VIDEO_UPLOAD} element={<VideoUpload />} />
            <Route path={PATHS.REFERRAL_REWARD} element={<ReferralReward />} />
          </Route>

          {/* Student flows (immersive) */}
          <Route path={PATHS.AUDIO_CALL} element={<AudioCall />} />
          <Route path={PATHS.LIVE_SESSION} element={<LiveSession />} />
          <Route path={PATHS.SHORT_LIVE_SESSION} element={<ShortLiveSessions />} />
          <Route path={PATHS.SESSION_FEEDBACK} element={<SessionFeedback />} />
          <Route path={PATHS.SESSION_HISTORY} element={<SessionHistory />} />
          <Route path={PATHS.DOUBT_SUBMITTED} element={<DoubtSubmitted />} />
          <Route path={PATHS.SPINNER} element={<Spinner />} />
          <Route path={PATHS.REFER_EARN} element={<ReferEarn />} />
          <Route path={PATHS.REFERRAL_HISTORY} element={<ReferralHistory />} />
          <Route path={PATHS.PLAN_UPGRADE} element={<PlanUpgrade />} />

          {/* Onboarding TEACHER */}
          <Route path={PATHS.TEACHER_REGISTRATION} element={<TeacherRegistration />} />
          <Route path={PATHS.QUALIFICATION_DETAILS} element={<TeacherQualificationDetails />} />
          <Route path={PATHS.BASICPROFILE_DETAILS} element={<BasicProfileDetails />} />
          <Route path={PATHS.EXPERIENCE_DETAILS} element={<TeacherExperienceDetails />} />
          <Route path={PATHS.TEACHERCLASS_SELECTION} element={<TeacherClassSelection />} />
          <Route path={PATHS.BOARD_SELECTION} element={<BoardSelection />} />
          <Route path={PATHS.LANGUAGE_SELECTION} element={<LanguageSelection />} />
          <Route path={PATHS.DOCUMENT_UPLOAD} element={<DocumentUpload />} />
          <Route path={PATHS.INTERVIEW_SCHEDULE} element={<InterviewScheduling />} />
          <Route path={PATHS.TEACHER_DEMO_VIDEO} element={<TeacherDemoVideo />} />
          <Route path={PATHS.PROFILE_REVIEW} element={<ProfileReview />} />
          <Route path={PATHS.INTERVIEW_CONFIRMATION} element={<InterviewConfirmation />} />
          

        {/* Teacher flows */}
        <Route path={PATHS.TEACHER_DASHBOARD} element={<Dashboard />} />
        <Route path={PATHS.AVAILABILITY_STATUS} element={<AvailabilityStatus />} />
        <Route path={PATHS.DIRECT_REQUEST_NOTIFICATION} element={<DirectRequestNotification />} />
        <Route path={PATHS.TEACHER_NOTIFICATIONS} element={<TeacherNotifications />} />
        <Route path={PATHS.TEACHER_WALLET} element={<WalletDashboard />} />
        <Route path={PATHS.TEACHER_EARNINGS_HISTORY} element={<EarningsHistory />} />
        <Route path={PATHS.TEACHER_SESSION_HISTORY} element={<TeachSessionHistory />} />
        <Route path={PATHS.TEACHER_REQUESTS} element={<RequestsPage />} />
        <Route path={PATHS.TEACHER_CLASSES} element={<CreateLiveClassRequest />} />
        <Route path={PATHS.TEACHER_LIBRARY} element={<RecordingLibrary />} />
        
          {/* Parent Module */} 
            <Route path={PATHS.ADD_CHILD} element={<AddChild />} />
            <Route path={PATHS.PARENT_DASHBOARD} element={<DashboardPage/>} />
            <Route path={PATHS.PARENT_LIVEACTIVITY} element={<LiveActivity/>} />
            <Route path={PATHS.PARENT_DOUBTHISTORY} element={<DoubtHistory/>} />
            


            
          {/* Protected legacy */}
          <Route element={<ProtectedRoute />}>
            <Route path={PATHS.DASHBOARD} element={<DashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={PATHS.SPLASH} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
