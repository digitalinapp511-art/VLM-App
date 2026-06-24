import React from "react";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const TeacherOverlayCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-4 z-20 w-44 p-4 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl border border-zinc-100 flex flex-col items-center gap-2"
    >
      <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" />
        <AvatarFallback className="bg-zinc-100">EP</AvatarFallback>
      </Avatar>
      
      <div className="text-center">
        <h4 className="text-[11px] font-black text-zinc-900 tracking-tight uppercase">
          Dr. Elena Petrova <span className="text-zinc-400 font-medium">| Faculty</span>
        </h4>
      </div>

      <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 text-[9px] font-bold py-1 px-3 rounded-full flex gap-1.5 border-none">
        STUDENTS: 24 ONLINE <Users size={10} />
      </Badge>
    </motion.div>
  );
};

export default TeacherOverlayCard;