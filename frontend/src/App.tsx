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
import StudentNotifications from "./pages/student/Notifications";
import ReferEarn from "./pages/ReferEarn";
import ReferralHistory from "./pages/student/ReferralHistory";
import LiveSession from "./pages/student/LiveSession";
import SessionFeedback from "./pages/student/SessionFeedBack";
import SessionHistory from "./pages/student/SessionHistory";
import ShortLiveSessions from "./pages/student/ShortLiveSession";
import ShortVideoFeed from "./pages/student/ShortVideoFeed";
import Library from "./pages/student/Library";
import UseSubscription from "./pages/student/UseSubscription";
import UseRecharge from "./pages/student/UseRecharge";
import SubjectSelection from "./pages/SubjectSelection";
import OnboardingSlides from "./pages/OnboardingSlides";
import PlanScreen from "./pages/student/PlanScreen";
import PaymentFailed from "./pages/student/PaymentFailed";
import DoubtSubmitted from "./pages/student/DoubtSubmitted";
import Coupon from "./pages/student/Coupon";
import PlanUpgrade from "./pages/student/PlanUpgrade";
import ReferralReward from "./pages/student/ReferralReward";
import AIChat from "./pages/student/AIChat";
import TeacherSearching from "./pages/student/TeacherSearching";
import ChatSession from "./pages/student/ChatSession";
import Leaderboard from "./pages/student/Leaderboard";
import EditProfile from "./pages/student/EditProfile";
import Profile from "./pages/student/Profile";
import { PATHS } from "@/routes/paths";
import TeacherRegistration from "./pages/teacher/TeacherRegistration";
import TeacherQualificationDetails from "./pages/teacher/TeacherQualificationDetails";
import BasicProfileDetails from "./pages/teacher/stepper/BasicProfileDetails";
import TeacherExperienceDetails from "./pages/teacher/stepper/TeacherExperienceDetails";
import TeacherClassSelection from "./pages/teacher/stepper/TeacherClassSelection";
import TeacherSubjectSelection from "./pages/TeacherSubjectSelection";
import AddChild from "./pages/Parent/Addchild";
import LiveActivity from "./pages/Parent/LiveActivity";
import DoubtHistory from "./pages/Parent/DoubtHistory";
import ParentDashboardPage from "./pages/Parent/ParentDashboardPage";
import BoardSelection from "./pages/teacher/stepper/BoardSelection";
import LanguageSelection from "./pages/teacher/stepper/LanguageSelection";
import DocumentUpload from "./pages/teacher/stepper/DocumentUpload";
import InterviewScheduling from "./pages/teacher/InterviewScheduling";
import TeacherDemoVideo from "./pages/teacher/TeacherDemoVideo";
import ProfileReview from "./pages/teacher/ProfileReview";
import InterviewConfirmation from "./pages/teacher/InterviewConfirmation";
import VerificationStatus from './pages/teacher/VerificationStatus';
import LiveClassRequestStatus from './pages/teacher/LiveClassRequestStatus';
import Dashboard from "./pages/teacher/Dashboard";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherEditProfile from "./pages/teacher/TeacherEditProfile";
import AvailabilityStatus from "./pages/teacher/AvailabilityStatus";
import DirectRequestNotification from "./pages/teacher/DirectRequestNotification";
import TeacherNotifications from "./pages/teacher/Notifications";
import WalletDashboard from "./pages/teacher/WalletDashboard";
import RewardCenter from "./pages/teacher/RewardCenter";
import ReferStudentPortal from "./pages/teacher/ReferStudentPortal";
import ReferTeacherPortal from "./pages/teacher/ReferTeacherPortal";
import TeacherReferralHistory from "./pages/teacher/ReferralHistory";
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

          {/* Protected Student Module */}
          <Route element={<ProtectedRoute />}>
            {/* Onboarding STUDENT */}
            <Route path={PATHS.CREATE_PROFILE} element={<CreateProfile />} />
            <Route path={PATHS.STUDENT_PROFILE_SETUP} element={<CreateProfile />} />
            <Route path={PATHS.ONBOARDING_SLIDES} element={<OnboardingSlides />} />
            <Route path={PATHS.SUBJECT_SELECTION} element={<SubjectSelection />} />
            <Route path={PATHS.LEARNING_PLAN} element={<LearningPlan />} />
            <Route path={PATHS.COUPON} element={<Coupon />} />
            <Route path={PATHS.PLAN_SCREEN} element={<PlanScreen />} />
            <Route path={PATHS.PAYMENT_FAILED} element={<PaymentFailed />} />
            
            {/* Student tabs */}
            <Route element={<StudentLayout />}>
              <Route path={PATHS.STUDENT_DASHBOARD} element={<StudentDashboard />} />
              <Route path={PATHS.STUDENT_NOTIFICATIONS} element={<StudentNotifications />} />
              <Route path={PATHS.ASK_DOUBT} element={<AskDoubt />} />
              <Route path={PATHS.LIVE_CLASSES} element={<LiveClasses />} />
              <Route path={PATHS.PROFILE} element={<EditProfile />} />
              <Route path={PATHS.WALLET} element={<Profile />} />
              <Route path={PATHS.VIDEO_UPLOAD} element={<VideoUpload />} />
              <Route path={PATHS.REFERRAL_REWARD} element={<ReferralReward />} />
            </Route>

            {/* Student flows (immersive) */}
            <Route path={PATHS.MCQ} element={<Mcq />} />
            <Route path={PATHS.AUDIO_CALL} element={<AudioCall />} />
            <Route path={PATHS.LIVE_SESSION} element={<LiveSession />} />
            <Route path={PATHS.SHORT_LIVE_SESSION} element={<ShortLiveSessions />} />
            <Route path={PATHS.SHORT_VIDEO_FEED} element={<ShortVideoFeed />} />
            <Route path={PATHS.LIBRARY} element={<Library />} />
            <Route path={PATHS.USE_SUBSCRIPTION} element={<UseSubscription />} />
            <Route path={PATHS.USE_RECHARGE} element={<UseRecharge />} />
            <Route path={PATHS.SESSION_FEEDBACK} element={<SessionFeedback />} />
            <Route path={PATHS.SESSION_HISTORY} element={<SessionHistory />} />
            <Route path={PATHS.DOUBT_SUBMITTED} element={<DoubtSubmitted />} />
            <Route path={PATHS.AI_CHAT} element={<AIChat />} />
            <Route path={PATHS.TEACHER_SEARCHING} element={<TeacherSearching />} />
            <Route path={PATHS.CHAT_SESSION} element={<ChatSession />} />
            <Route path={PATHS.LEADERBOARD} element={<Leaderboard />} />
            <Route path={PATHS.SPINNER} element={<Spinner />} />
            <Route path={PATHS.REFER_EARN} element={<ReferEarn />} />
            <Route path={PATHS.REFERRAL_HISTORY} element={<ReferralHistory />} />
            <Route path={PATHS.PLAN_UPGRADE} element={<PlanUpgrade />} />
          </Route>

          {/* Onboarding TEACHER */}
          <Route path={PATHS.TEACHER_REGISTRATION} element={<TeacherRegistration />} />
          <Route path={PATHS.QUALIFICATION_DETAILS} element={<TeacherQualificationDetails />} />
          <Route path={PATHS.BASICPROFILE_DETAILS} element={<BasicProfileDetails />} />
          <Route path={PATHS.EXPERIENCE_DETAILS} element={<TeacherExperienceDetails />} />
          <Route path={PATHS.TEACHER_SUBJECT_SELECTION} element={<TeacherSubjectSelection />} />
          <Route path={PATHS.TEACHERCLASS_SELECTION} element={<TeacherClassSelection />} />
          <Route path={PATHS.BOARD_SELECTION} element={<BoardSelection />} />
          <Route path={PATHS.LANGUAGE_SELECTION} element={<LanguageSelection />} />
          <Route path={PATHS.DOCUMENT_UPLOAD} element={<DocumentUpload />} />
          <Route path={PATHS.INTERVIEW_SCHEDULE} element={<InterviewScheduling />} />
          <Route path={PATHS.TEACHER_DEMO_VIDEO} element={<TeacherDemoVideo />} />
          <Route path={PATHS.PROFILE_REVIEW} element={<ProfileReview />} />
          <Route path={PATHS.INTERVIEW_CONFIRMATION} element={<InterviewConfirmation />} />
          <Route path={PATHS.VERIFICATION_STATUS} element={<VerificationStatus />} />
          

        {/* Teacher flows */}
        <Route path={PATHS.TEACHER_DASHBOARD} element={<Dashboard />} />
        <Route path={PATHS.TEACHER_PROFILE} element={<TeacherProfile />} />
        <Route path={PATHS.TEACHER_EDIT_PROFILE} element={<TeacherEditProfile />} />
        <Route path={PATHS.AVAILABILITY_STATUS} element={<AvailabilityStatus />} />
        <Route path={PATHS.DIRECT_REQUEST_NOTIFICATION} element={<DirectRequestNotification />} />
        <Route path={PATHS.TEACHER_NOTIFICATIONS} element={<TeacherNotifications />} />
        <Route path={PATHS.TEACHER_WALLET} element={<WalletDashboard />} />
        <Route path={PATHS.REWARD_CENTER} element={<RewardCenter />} />
        <Route path={PATHS.REFER_STUDENT} element={<ReferStudentPortal />} />
        <Route path={PATHS.REFER_TEACHER} element={<ReferTeacherPortal />} />
        <Route path={PATHS.TEACHER_REFERRAL_HISTORY} element={<TeacherReferralHistory />} />
        <Route path={PATHS.TEACHER_EARNINGS_HISTORY} element={<EarningsHistory />} />
        <Route path={PATHS.TEACHER_SESSION_HISTORY} element={<TeachSessionHistory />} />
        <Route path={PATHS.TEACHER_REQUESTS} element={<RequestsPage />} />
        <Route path={PATHS.TEACHER_CLASSES} element={<LiveClassRequestStatus />} />
        <Route path={PATHS.CREATE_LIVE_CLASS} element={<CreateLiveClassRequest />} />
        <Route path={PATHS.TEACHER_LIBRARY} element={<RecordingLibrary />} />
        
          {/* Parent Module */} 
            <Route path={PATHS.ADD_CHILD} element={<AddChild />} />
            <Route path={PATHS.PARENT_DASHBOARD} element={<ParentDashboardPage/>} />
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
