import React, { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/lib/teacher-api";

import SessionHeader from "@/components/basic/teacher/SessionHeader";
import ChatBubble, { MathAttachment, AudioAttachment } from "@/components/basic/teacher/ChatBubble";
import ChatInput from "@/components/basic/teacher/ChatInput";

const TeacherSession: React.FC = () => {
  const location = useLocation();
  const chatId = location.state?.chatId as string | undefined;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch real chat messages if chatId provided
  const { data: chatData } = useQuery({
    queryKey: ["teacherSessionChat", chatId],
    queryFn: () => teacherApi.getSessionChat(chatId!),
    enabled: !!chatId,
    refetchInterval: 5000, // Poll every 5s for new messages
  });

  const messages = chatData?.messages ?? [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className={cn("min-h-screen flex flex-col items-center relative overflow-x-hidden", bgCss)}>
      {/* Background Decorators */}
      <div className="absolute top-[30%] -right-4 text-purple-500/20 blur-[1px]">
        <Star size={24} fill="currentColor" />
      </div>
      <div className="absolute top-[10%] -left-2 text-cyan-400/20 blur-[1px] rotate-45">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute bottom-[20%] -left-3 text-cyan-500/20 blur-[1px]">
        <Star size={16} fill="currentColor" />
      </div>

      <div className="w-full max-w-xl flex-1 flex flex-col px-4 relative">
        <SessionHeader />

        {/* Scrollable Chat Area */}
        <div className="flex-1 flex flex-col gap-4 py-8 overflow-y-auto no-scrollbar">
          {messages.length > 0 ? (
            messages.map((msg: any) => (
              <ChatBubble
                key={msg.id}
                variant={msg.senderType === "TEACHER" ? "teacher" : "student"}
                senderName={msg.senderType === "TEACHER" ? "Teacher" : chatData?.chat?.student?.fullName ?? "Student"}
              >
                {msg.content}
              </ChatBubble>
            ))
          ) : (
            // Fallback sample conversation when no chatId or no messages yet
            <>
              <ChatBubble variant="student" senderName="Student">
                I'm stuck on this second derivative step. Can you help?
              </ChatBubble>
              <MathAttachment />
              <AudioAttachment />
              <ChatBubble variant="teacher" senderName="Teacher">
                Certainly! Let's break it down step by step.
              </ChatBubble>
              <ChatBubble variant="teacher" senderName="">
                <div className="space-y-1">
                  Start with <code className="bg-white/10 px-1 rounded text-sm">dy/dx = f'(x)</code>,
                  then <code className="bg-white/10 px-1 rounded text-sm">d²y/dx² = [...]</code>.
                  <br />Look at this term.
                </div>
              </ChatBubble>
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black to-transparent pb-4 pt-10">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default TeacherSession;
