import { useNavigate } from "react-router-dom";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/routes/paths";
import type { Role } from "@/types";

export default function ComingSoonPage() {
  const navigate = useNavigate();
  const role = (sessionStorage.getItem("vlm_role") ?? "parent") as Role;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="vlm-bg-navy flex min-h-svh w-full flex-col items-center justify-center bg-[#050505] px-6 text-white">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Construction className="h-12 w-12 text-cyan-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{roleLabel} Portal</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            The {roleLabel.toLowerCase()} experience is coming soon. Please check back later or switch to the student role.
          </p>
        </div>
        <Button
          onClick={() => navigate(PATHS.ROLE_SELECT, { replace: true })}
          className="h-14 w-full max-w-xs rounded-full bg-gradient-to-b from-[#1e3a8e] to-[#0f172a] border border-blue-400/40 text-white font-bold"
        >
          Back to Role Select
        </Button>
      </div>
    </div>
  );
}
