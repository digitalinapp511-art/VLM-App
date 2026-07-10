import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  GraduationCap,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Types
import type { Role } from "@/types";
import { PATHS } from "@/routes/paths";

// --- CUSTOM UI PRIMITIVES (To avoid raw HTML) ---
const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <main className={cn("vlm-bg flex min-h-svh w-full flex-col items-center justify-center p-6", className)}>
    {children}
  </main>
);

const Stack = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col", className)}>{children}</div>
);

// const Row = ({ children, className }: { children: React.ReactNode; className?: string }) => (
//   <div className={cn("flex items-center", className)}>{children}</div>
// );

const Typography = ({ variant, children, className }: { variant: 'h1' | 'p' | 'small'; children: React.ReactNode; className?: string }) => {
  const styles = {
    h1: "text-base  text-white leading-snug",
    p: "text-xs md:text-sm text-white/50 leading-snug break-words whitespace-normal pr-8 md:pr-0",
    small: "text-center text-xs  tracking-[0.22em] text-white/60 uppercase mb-10",
  };
  const Tag = variant === 'small' ? 'span' : 'p';
  return <Tag className={cn(styles[variant], className)}>{children}</Tag>;
};

// --- CONFIG ---
interface RoleConfig {
  id: Role;
  label: string;
  description: string;
  Icon: LucideIcon;
}

const ROLES: RoleConfig[] = [
  { id: "student", label: "Student", description: "Explore courses, take quizzes, track progress.", Icon: BookOpen },
  { id: "parent", label: "Parent", description: "View reports, connect with teachers, monitor growth.", Icon: Users },
  { id: "teacher", label: "Teacher", description: "Manage classes, create content, grade assignments.", Icon: GraduationCap },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem("vlm_role", selected);
    if (selected === "student") {
      localStorage.setItem("vlm_student_theme", "light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
    navigate(PATHS.LOGIN);
  };

  return (
    <Container>
      <Stack className="w-full max-w-md lg:max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <Typography variant="small">
          Welcome, Please Select Your Role
        </Typography>

        {/* Role Selection List */}
        <Stack className="gap-4">
          {ROLES.map((role) => {
            const isActive = selected === role.id;
            return (
              <Button
                key={role.id}
                variant="ghost"
                onClick={() => setSelected(role.id)}
                className={cn(
                  "relative border-1 border-olive-600 h-auto w-full justify-start rounded-2xl p-0 overflow-hidden transition-all duration-300",
                  "hover:bg-white/[0.08] active:scale-[0.98]",
                  isActive && "border-yellow-200 ring-1 ring-[var(--vlm-gold)]/50"
                )}
              >
                <Card className={cn(
                  "w-full border-none bg-transparent transition-all",
                  isActive ? "bg-white/[0.1] shadow-[0_0_24px_rgba(245,200,66,0.15)]" : "bg-white/[0.04]"
                )}>
                  <CardContent className="flex items-center gap-4 p-5">
                    {/* Icon Container */}
                    <Stack className={cn(
                      "h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isActive ? "bg-[var(--vlm-gold)] text-black" : "bg-white/5 text-[var(--vlm-gold)]/80"
                    )}>
                      <role.Icon size={22} strokeWidth={2} />
                    </Stack>

                    {/* Role Info */}
                    <Stack className="flex-1 text-left">
                      <Typography variant="h1" className={isActive ? "text-[var(--vlm-gold)]" : "text-white"}>
                        {role.label}
                      </Typography>
                      <Typography variant="p">
                        {role.description}
                      </Typography>
                    </Stack>

                    {/* Active Status Badge */}
                    {isActive && (
                      <Badge className="absolute right-4 top-4 bg-[var(--vlm-gold)] text-black font-black text-[9px] tracking-widest border-none">
                        <CheckCircle2 size={10} className="mr-1" /> ACTIVE
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Button>
            );
          })}
        </Stack>

        {/* Action Button */}
        <Stack className="mt-10 pt-4">
          <Button
            size="xs"
            disabled={!selected}
            onClick={handleContinue}
            style={{ background: "linear-gradient(180deg, #1e3a8e 0%, #0f172a 100%)" }}
            className={cn(
              "h-14 rounded-2xl text-sm font-black tracking-[0.2em] transition-all duration-300",
              selected 
                ? "bg-gradient-to-r from-[#2a3a6e] relative text-white w-full rounded-2xl text-md tracking-wide border border-blue-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] hover:brightness-110 to-[#1e2a50] text-white shadow-xl hover:brightness-125" 
                : "bg-white/5 text-white/20 border border-white/5"
            )}
          >
            CONTINUE
          </Button>
        </Stack>

      </Stack>
    </Container>
  );
}