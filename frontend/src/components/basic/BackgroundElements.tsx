import {BookOpen, GraduationCap, Lightbulb, Settings, Star} from 'lucide-react'
export function BackgroundElement(){
    return (
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Radial Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-blue-900/10 blur-[120px]" />
              
              {/* Floating Outline Icons */}
              <BookOpen className="absolute top-[8%] left-[10%] text-white/10 -rotate-12" size={32} />
              <GraduationCap className="absolute top-[7%] right-[10%] text-white/10 rotate-12" size={32} />
              <Lightbulb className="absolute top-[25%] left-[6%] text-yellow-500/30" size={26} />
              <Settings className="absolute top-[22%] right-[8%] text-blue-400/30" size={28} />
              <Star className="absolute top-[35%] right-[6%] text-yellow-500/40 fill-yellow-500/20" size={24} />
            </div>

    )
}