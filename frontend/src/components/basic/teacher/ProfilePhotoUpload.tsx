import React from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ProfilePhotoUpload: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-[24px] border border-white/10 bg-white/[0.02] w-full max-w-[140px] aspect-[1/1.4] justify-center">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-2 border-white/10 bg-zinc-800">
          <AvatarImage src="" />
          <AvatarFallback className="bg-zinc-800">
             {/* Default icon representation from image */}
             <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#8c6054]" />
                <div className="w-12 h-8 rounded-t-full bg-[#2d3b4d] -mt-1" />
             </div>
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 h-8 flex gap-2">
          <Camera size={14} />
          <span className="text-xs">Upload</span>
        </Button>
        <span className="text-[10px] text-zinc-500 text-center font-medium leading-tight">
          Add Profile<br />Photo
        </span>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;