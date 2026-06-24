import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RetryButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const RetryButton: React.FC<RetryButtonProps> = ({ onClick, loading }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Button
        onClick={onClick}
        disabled={loading}
        className={cn(
          "w-full h-16 rounded-2xl text-lg font-bold transition-all",
          "bg-gradient-to-b from-[#2b4b9b] to-[#1a2e5d] hover:brightness-110",
          "border border-blue-400/20 shadow-[0_0_30px_rgba(37,99,235,0.3)]",
          "text-white flex items-center justify-center gap-3 uppercase tracking-wider"
        )}
      >
        <RefreshCw className={cn("w-6 h-6", loading && "animate-spin")} />
        Retry Connection
      </Button>
    </motion.div>
  );
};

export default RetryButton;