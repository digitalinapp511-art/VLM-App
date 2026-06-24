import logo from '../../assets/logo.png'
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
const Row = ({ children, className }: any) => <div className={cn("flex items-center", className)}>{children}</div>;
const Stack = ({ children, className }: any) => <div className={cn("flex flex-col", className)}>{children}</div>;

export function VlmWordmark({ role, center }: { role: string; center?: boolean }) {
  return (
    <Stack className={cn("gap-1.5", center && "items-center")}>
      <Row className={cn("gap-1.5 font-black tracking-tighter text-white", center ? "text-2xl" : "text-4xl")}>
        {/* <span style={{fontFamily:"Cinzel"}} className="bg-gradient-to-tr from-[#ffe066] to-[#f5a623] bg-clip-text text-transparent">Vlm</span>
        <span style={{fontFamily:"Cinzel"}}>Academy</span> */}
        <img src={logo} width={180} height={180} alt="" />
        <Star size={center ? 14 : 20} className="vlm-gold-text fill-current mb-4" strokeWidth={0} />
      </Row>
      <Badge variant="outline" className=" text-[var(--vlm-gold)]  tracking-[0.3em] px-3 rounded-full ">
        {role.toUpperCase()} MODULE
      </Badge>
    </Stack>
  );
}
