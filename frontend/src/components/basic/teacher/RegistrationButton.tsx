import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
interface RegistrationButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const RegistrationButton: React.FC<RegistrationButtonProps> = ({ onClick, loading }) => {
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
      <Button
        onClick={onClick}
        disabled={loading}
        className={cn(
          "w-full h-12 rounded-2xl text-[15px] font-semibold transition-all",
          "bg-gradient-to-br from-blue-600 to-indigo-900 hover:brightness-110",
          "border border-white/10 shadow-lg text-white flex items-center justify-center gap-2"
        )}
      >
        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Start Registration >"}
      </Button>
    </motion.div>
  );
};

export default RegistrationButton;