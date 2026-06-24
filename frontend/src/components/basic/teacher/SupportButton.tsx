import React from "react";
import { Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SupportButtonProps {
  onClick: () => void;
}

const SupportButton: React.FC<SupportButtonProps> = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Button
        onClick={onClick}
        className={cn(
          "w-full h-16 rounded-2xl text-lg font-bold transition-all",
          "bg-gradient-to-b from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
          "border border-blue-400/20 shadow-[0_0_30px_rgba(37,99,235,0.3)]",
          "text-white flex items-center justify-center gap-3 uppercase tracking-wider"
        )}
      >
        <Headset size={24} />
        Contact Support
      </Button>
    </motion.div>
  );
};

export default SupportButton;