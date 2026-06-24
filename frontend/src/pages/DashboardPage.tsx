import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("vlm_token");
    sessionStorage.removeItem("vlm_role");
    navigate(PATHS.SPLASH, { replace: true });
  };

  return (
    <div className="vlm-bg min-h-svh w-full flex flex-col items-center justify-center gap-6 px-5">
      <div className="text-center vlm-fade-in">
        <h1 className="text-3xl font-extrabold text-white">
          Welcome to <span className="vlm-gold-text">VLM Academy</span>
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Your dashboard is being built. Stay tuned!
        </p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}
