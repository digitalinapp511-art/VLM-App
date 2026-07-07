import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StarRatingProps {
  studentName?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ studentName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-[13px] font-medium text-zinc-300">
        Rate your session with {studentName || "the student"}:
      </p>
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              size={36}
              strokeWidth={1.5}
              className={cn(
                "transition-all duration-300",
                (hover || rating) >= star
                  ? "text-cyan-400 fill-cyan-400/20 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                  : "text-cyan-400 opacity-60"
              )}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default StarRating;